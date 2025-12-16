// BrowserStack Local tunnel cleanup

const { bsLocal } = require("./fixture");
const { promisify } = require("util");
const sleep = promisify(setTimeout);

module.exports = async () => {
  if (bsLocal && bsLocal.isRunning()) {
    console.log("Stopping BrowserStack Local tunnel...");

    let localStopped = false;
    bsLocal.stop(() => {
      localStopped = true;
      console.log("BrowserStack Local tunnel stopped");
    });

    let waitTime = 0;
    while (!localStopped && waitTime < 10000) {
      await sleep(1000);
      waitTime += 1000;
    }
  }
};
