const currentEnv = process.env.NODE_ENV;

let config = {
  production: {
    DEPLOYMENT_NAME: process.env.DEPLOYMENT_NAME,
    DEPLOYMENT_NAMESPACE: process.env.DEPLOYMENT_NAMESPACE,
    SECRETS_STORE_PATH: process.env.SECRETS_STORE_PATH,
    DELAY_RESTART: process.env.DELAY_RESTART,
  },
  test: {
    DEPLOYMENT_NAME: process.env.DEPLOYMENT_NAME_TEST,
    DEPLOYMENT_NAMESPACE: process.env.DEPLOYMENT_NAMEPSPACE_TEST,
    SECRETS_STORE_PATH: process.env.SECRETS_STORE_PATH_TEST,
    DELAY_RESTART: process.env.DELAY_RESTART_TEST,
  },
};

module.exports = config[currentEnv];
