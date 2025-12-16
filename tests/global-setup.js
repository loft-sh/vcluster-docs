// BrowserStack Local tunnel startup for testing internal URLs

const { bsLocal, BS_LOCAL_ARGS } = require("./fixture");
const { promisify } = require("util");
const sleep = promisify(setTimeout);

module.exports = async () => {
  if (process.env.BROWSERSTACK_LOCAL === "true") {
    console.log("Starting BrowserStack Local tunnel...");

    let localResponseReceived = false;
    let startError = null;

    bsLocal.start(BS_LOCAL_ARGS, (err) => {
      if (err) {
        console.error("Error starting BrowserStack Local:", err);
        startError = err;
      } else {
        console.log("BrowserStack Local tunnel started successfully");
      }
      localResponseReceived = true;
    });

    let waitTime = 0;
    while (!localResponseReceived && waitTime < 30000) {
      await sleep(1000);
      waitTime += 1000;
    }

    if (startError) throw startError;
    if (!localResponseReceived) {
      throw new Error("BrowserStack Local startup timed out");
    }
  }
};
