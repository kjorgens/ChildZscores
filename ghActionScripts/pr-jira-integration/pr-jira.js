const core = require('@actions/core');
const github = require('@actions/github');

(async () => {
  try {
    // console.log(`Hello, welcome the pull request action`);
    // console.log(`event = ${ github.event }`);
    // console.log(`workflow = ${ github.workflow }`);
    // console.log(`event_name = ${ github.event_name }`);
    // console.log(`head_ref = ${ github.head_ref }`);
    // console.log(`ref = ${ github.ref }`);
    const nameToGreet = core.getInput('who-to-greet');
    console.log(`Hello ${nameToGreet}!`);
    const time = (new Date()).toTimeString();
    core.setOutput('time', time);
    const payload = JSON.stringify(github.context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`);
    console.log(`event = ${ github.context.payload.action }`);
    console.log(`event = ${ github.context.payload.name }`);
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
