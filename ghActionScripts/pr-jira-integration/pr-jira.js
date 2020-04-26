const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require("@octokit/action");

(async () => {
  try {
    const eventPayload = require(process.env.GITHUB_EVENT_PATH);
    const octokit = new Octokit();
    console.log()
    const { data } = await octokit.request(
      "POST /repos/:repository/issues/:pr_number/comments",
      {
        repository: process.env.GITHUB_REPOSITORY,
        pr_number: eventPayload.pull_request.number,
        body: "Thank you for your pull request!"
      }
    );

    console.log("Comment created: %d", data.html_url);
    const nameToGreet = core.getInput('who-to-greet');
    console.log(`Hello ${nameToGreet}!`);
    const time = (new Date()).toTimeString();
    core.setOutput('time', time);
    // const payload = JSON.stringify(github.context.payload, undefined, 2);
    // console.log(`The event payload: ${payload}`);
    // console.log(`event = ${ github.context.payload.action }`);
    // console.log(`pr base label = ${ github.context.payload.pull_request.base.label }`);
    // Get the JSON webhook payload for the event that triggered the workflow
    // const payload = JSON.stringify(github.context.payload, undefined, 2);
    // console.log(`The event payload: ${payload}`);
    // const action = req.body.action;
    // const prNumber = req.body.number;
    // const repo = req.body.pull_request.base.repo.name;
    // const baseBranch = req.body.pull_request.base.ref;
    // const headBranch = req.body.pull_request.head.ref;
    // const prTitle = req.body.pull_request.title;
    // const prBody = req.body.pull_request.body;
    // const soxProject = await tfTools.repoTopicExists(repo, 'sox');
    // const gitflowFlag = await tfTools.repoTopicExists(repo, 'gitflow');

    // if (action.indexOf('synchronize') > -1) {
    //   await evalJiraInfoInPR(req.body.repository.name, req.body.number, headBranch);
    // } else if (action.indexOf('opened') > -1) {
    //   await evalJiraInfoInPR(req.body.repository.name, req.body.number, headBranch);
    // }
  } catch (error) {
    core.setFailed(error.message);
  }
})();
