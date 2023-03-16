require('dotenv').config();
const fsPromises = require('fs/promises');
const k8s = require('@kubernetes/client-node');
const yaml = require('js-yaml');
const fs = require('fs');
const config = require('./config');
const YAML = require('yaml');
// Setup node k8s client
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApiAppsV1 = kc.makeApiClient(k8s.AppsV1Api);
const options = {
  headers: { 'Content-type': k8s.PatchUtils.PATCH_FORMAT_JSON_PATCH },
};
async function getDeploymentSpec() {
  try {
    // Load the Kubernetes configuration from the default location
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    // Create a new Kubernetes API client using the loaded configuration
    const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

    // Send the GET request to the API endpoint and wait for the response
    const res = await k8sApi.readNamespacedDeployment(
      config.DEPLOYMENT_NAME,
      config.DEPLOYMENT_NAMESPACE
    );
    let doc = new YAML.Document();
    doc.contents = res.body;
    return doc;
  } catch (error) {
    console.error(error);
  }
}

// Read the environment variables specified in the k8s deployment
function getEnvVarsFromDeployment(yamlDoc) {
  try {
    // Parse the YAML into a JavaScript object or array
    const parsedFileContents = yaml.loadAll(yamlDoc);
    let parsedEnvVarsByDoc = [];
    // Iterate over the file
    for (const doc of parsedFileContents) {
      if (doc.kind === 'Deployment') {
        for (let i = 0; i < doc.spec.template.spec.containers.length; i++) {
          let containerEnvVars = doc.spec.template.spec.containers[i].env;
          parsedEnvVarsByDoc.push(containerEnvVars);
        }
      }
    }

    if (parsedEnvVarsByDoc.length < 0) {
      const error = new Error('No environment variables found in the file');
      throw error;
    }
    return parsedEnvVarsByDoc;
  } catch (e) {
    console.error(e);
    return;
  }
}

// get the index of the environment variable in the deployment
function findIndexes(envVarName, newValue, envVariableContainer) {
  for (let i = 0; i < envVariableContainer.length; i++) {
    for (let j = 0; j < envVariableContainer[i].length; j++) {
      if (envVariableContainer[i][j].name == envVarName) {
        return [i, j];
      }
    }
  }
  return -1; // not found
}

// generate a body for the k8s API patch request
function genPatchBody(envVariables, envVariableContainer) {
  const patchBody = [];
  for (keyValue of envVariables) {
    const [envVarName, newValue] = keyValue;
    const [containerIndex, envVarIndex] = findIndexes(
      envVarName,
      newValue,
      envVariableContainer
    );
    if (envVarIndex !== -1) {
      patchBody.push({
        op: 'replace',
        path: `/spec/template/spec/containers/${containerIndex}/env/${envVarIndex}/value`,
        value: newValue,
      });
    } else {
      console.error(
        `Environment variable ${envVarName} not found in the deployment file`
      );
    }
  }
  return patchBody;
}

// patch a environment variable using k8s API
async function patchDeploymentSpec(paths, envVariableContainer) {
  try {
    const envVariables = [];
    for (let filePath of paths) {
      const secretsObj = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(secretsObj);
      const key = Object.keys(data)[0];
      envVariables.push([key, data[key]]);
    }
    const patchDeploymentSpec = genPatchBody(
      envVariables,
      envVariableContainer
    );
    let patchRes = await k8sApiAppsV1.patchNamespacedDeployment(
      'hasura-deployment',
      'default',
      patchDeploymentSpec,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      options
    );
    return patchRes;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

async function getFilesInDir() {
  //passsing directoryPath and callback function
  let fileNames = await fsPromises.readdir(config.SECRETS_STORE_PATH);
  const paths = fileNames.map((fileName) => {
    return `${config.SECRETS_STORE_PATH}/${fileName}`;
  });

  return paths;
}

module.exports = {
  getDeploymentSpec,
  getEnvVarsFromDeployment,
  findIndexes,
  genPatchBody,
  patchDeploymentSpec,
  getFilesInDir,
};
