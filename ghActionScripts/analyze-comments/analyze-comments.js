const core = require('@actions/core');
const github = require('@actions/github');

(async () => {
  try {
    // `who-to-greet` input defined in action metadata file
    const myToken = core.getInput('repo-token');
    console.log(`token = ${ myToken }`);
    const octokit = new github.GitHub(myToken);
    const nameToGreet = core.getInput('who-to-greet');
    console.log(`Hello ${nameToGreet}!`);
    console.log(`actor = ${ process.env.GITHUB_ACTOR }`);
    console.log(`repo = ${ process.env.GITHUB_REPOSITORY }`);
    console.log(`event = ${ process.env.GITHUB_EVENT_NAME }`);
    console.log(`gh action id = ${ process.env.GITHUB_ACTION }`);
    const time = (new Date()).toTimeString();
    core.setOutput('time', time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
})();
