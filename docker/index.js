const express = require('express');
const chokidar = require('chokidar');
require('dotenv').config();
const config = require('./config');
const {
  getDeploymentSpec,
  getEnvVarsFromDeployment,
  patchDeploymentSpec,
  getFilesInDir,
} = require('./refresh-credentials');

const port = 3000;

const app = express();
let envVarContainer = null;

let paths = [];
let canFire = true;
async function triggerRestartJob(path) {
  try {
    // Increment the count each time main is called
    paths.push(path);

    // Wait for x seconds before executing the trigger function
    // default: 10 seconds

    await delay(config.DELAY_RESTART);

    // Check if the fire function can be executed
    if (canFire) {
      canFire = false;
      await patchDeploymentSpec(paths, envVarContainer);
      paths = [];
      canFire = true;
    }
  } catch (e) {
    console.error(e);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  // watch for changes to the directory mounted by AWS-SMCP
  chokidar
    .watch(config.SECRETS_STORE_PATH, {
      ignoreInitial: true,
      persistent: true,
    })
    .on('all', async (event, path) => {
      console.log(event, path);
      let result = await triggerRestartJob(path);
      console.log(result);
    })
    .on('ready', async () => {
      try {
        const yamlDoc = await getDeploymentSpec();
        envVarContainer = getEnvVarsFromDeployment(yamlDoc);
        const paths = await getFilesInDir();
        await patchDeploymentSpec(paths, envVarContainer);
        console.log('Initial scan complete. Ready for changes');
      } catch (e) {
        console.error(e);
      }
    });
});
