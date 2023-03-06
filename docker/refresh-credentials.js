const fs = require('fs');
const fsPromises = require('fs').promises;
const k8s = require('@kubernetes/client-node');
const axios = require('axios');

// Setup node k8s client
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sApiAppsV1 = kc.makeApiClient(k8s.AppsV1Api);
const options = {
  headers: { 'Content-type': k8s.PatchUtils.PATCH_FORMAT_JSON_PATCH },
};

// change the spec of the deployment which triggers rolling update
async function restartDeployment() {
  try {
    const jsonData = await fsPromises.readFile(
      './secrets-store/secret-token',
      'utf8'
    );
    const data = JSON.parse(jsonData);
    const patchDeploymentSpec = [
      {
        op: 'replace',
        path: '/spec/template/spec/containers/0/env/2/value',
        value: data['username'].toString(),
      },
    ];
    const patchRes = await k8sApiAppsV1.patchNamespacedDeployment(
      'nginx-deployment',
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

fs.watchFile('./secrets-store/secret-token', async (curr, prev) => {
  try {
    restartDeployment()
      .then((res) => {
        return res;
      })
      .catch((e) => {
        throw e;
      });
  } catch (e) {
    console.error(e);
    throw e;
  }
});
