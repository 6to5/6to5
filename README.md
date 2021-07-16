<p align="center">
  <a href="https://babeljs.io/">
    <img alt="babel" src="https://raw.githubusercontent.com/babel/logo/master/babel.png" width="546">
  </a>
</p>

<p align="center">
  The compiler for writing next generation JavaScript.
</p>

<p align="center">
  <a href="https://gitpod.io/#https://github.com/babel/babel"><img alt="Gitpod ready-to-code" src="https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod"></a>
</p>
<p align="center">
    <a href="https://www.npmjs.com/package/@babel/core"><img alt="v7 npm Downloads" src="https://img.shields.io/npm/dm/@babel/core.svg?maxAge=43200&label=v7%20downloads"></a>
  <a href="https://www.npmjs.com/package/babel-core"><img alt="v6 npm Downloads" src="https://img.shields.io/npm/dm/babel-core.svg?maxAge=43200&label=v6%20downloads"></a>
</p>
<p align="center">
  <a href="https://github.com/babel/babel/actions/workflows/ci.yml"><img alt="GitHub CI Status" src="https://github.com/babel/babel/actions/workflows/ci.yml/badge.svg?branch=main"></a>
  <a href="https://codecov.io/github/babel/babel"><img alt="Coverage Status" src="https://img.shields.io/codecov/c/github/babel/babel/main.svg?maxAge=43200"></a>
  <a href="https://slack.babeljs.io/"><img alt="Slack Status" src="https://slack.babeljs.io/badge.svg"></a>
  <a href="https://twitter.com/intent/follow?screen_name=babeljs"><img alt="Follow on Twitter" src="https://img.shields.io/twitter/follow/babeljs.svg?style=social&label=Follow"></a>
</p>

<h2 align="center">Supporting Babel</h2>

<p align="center">
  <a href="#backers"><img alt="Backers on Open Collective" src="https://opencollective.com/babel/backers/badge.svg" /></a>
  <a href="#sponsors"><img alt="Sponsors on Open Collective" src="https://opencollective.com/babel/sponsors/badge.svg" /></a>
  <a href="https://medium.com/friendship-dot-js/i-peeked-into-my-node-modules-directory-and-you-wont-believe-what-happened-next-b89f63d21558"><img alt="Business Strategy Status" src="https://img.shields.io/badge/business%20model-flavortown-green.svg"></a>
</p>

Babel (pronounced ["babble"](https://soundcloud.com/sebmck/how-to-pronounce-babel))  is a community-driven project used by many companies and projects, and is maintained by a group of [volunteers](https://babeljs.io/team). If you'd like to help support the future of the project, please consider:

- Giving developer time on the project. (Message us on [Twitter](https://twitter.com/babeljs) or [Slack](https://slack.babeljs.io/) for guidance!)
- Giving funds by becoming a sponsor on [Open Collective](https://opencollective.com/babel) or [Patreon](https://www.patreon.com/henryzhu)!

## Sponsors

Our top sponsors are shown below! [[Become a sponsor](https://opencollective.com/babel#sponsor)]

<a href="https://opencollective.com/babel/sponsor/0/website" target="_blank"><img src="https://opencollective.com/babel/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/babel/sponsor/1/website" target="_blank"><img src="https://opencollective.com/babel/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/babel/sponsor/2/website" target="_blank"><img src="https://opencollective.com/babel/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/babel/sponsor/3/website" target="_blank"><img src="https://opencollective.com/babel/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/babel/sponsor/4/website" target="_blank"><img src="https://opencollective.com/babel/sponsor/4/avatar.svg"></a>
 <a href="https://opencollective.com/babel/sponsor/5/website" target="_blank"><img src="https://opencollective.com/babel/sponsor/5/avatar.svg"></a>
  <a href="https://opencollective.com/babel/sponsor/6/website" target="_blank"><img src="https://opencollective.com/babel/sponsor/6/avatar.svg"></a>
  <a href="https://opencollective.com/babel/sponsor/7/website" target="_blank"><img src="https://opencollective.com/babel/sponsor/7/avatar.svg"></a>
  <a href="https://opencollective.com/babel/sponsor/8/website" target="_blank"><img src="https://opencollective.com/babel/sponsor/8/avatar.svg"></a>
  <a href="https://opencollective.com/babel/sponsor/9/website" target="_blank"><img src="https://opencollective.com/babel/sponsor/9/avatar.svg"></a>
  <a href="https://opencollective.com/babel/sponsor/10/website" target="_blank"><img src="https://opencollective.com/babel/sponsor/10/avatar.svg"></a>
  <a href="https://opencollective.com/babel/sponsor/11/website" target="_blank"><img src="https://opencollective.com/babel/sponsor/11/avatar.svg"></a>
  <a href="https://opencollective.com/babel/sponsor/12/website" target="_blank"><img src="https://opencollective.com/babel/sponsor/12/avatar.svg"></a>
  <a href="https://opencollective.com/babel/sponsor/13/website" target="_blank"><img src="https://opencollective.com/babel/sponsor/13/avatar.svg"></a>
  <a href="https://opencollective.com/babel/sponsor/14/website" target="_blank"><img src="https://opencollective.com/babel/sponsor/14/avatar.svg"></a>

## Intro

Babel is a tool that helps you write code in the latest version of JavaScript. When your supported environments don't support certain features natively, Babel will help you compile those features down to a supported version.

**Input**

```js
// ES2020 nullish coalescing
function greet(input) {
  return input ?? "Hello world";
}
```

**Output**

```js
function greet(input) {
  return input != null ? input : "Hello world";
}
```

Try it out at our [REPL](https://babel.dev/repl#?browsers=defaults%2C%20not%20ie%2011&loose=true&code_lz=GYVwdgxgLglg9mABAcwE4FN1QBQzABxCgEpEBvAKEUQyhFST0KkQH5XEAiACXQBs-cRAHc4qPgBNOAbgoBfIA&shippedProposals=true&sourceType=script&lineWrap=true&presets=env%2Cenv&prettier=true).

## FAQ

### Who maintains Babel?

Mostly a handful of volunteers, funded by you! Please check out our [team page](https://babeljs.io/team)!

### Is there a Babel song?

I'm so glad you asked: [Hallelujah —— In Praise of Babel](SONG.md) by [@angus-c](https://github.com/angus-c), [audio version](https://youtu.be/40abpedBKK8) by [@swyx](https://twitter.com/@swyx). Tweet us your recordings!

### Looking for support?

For questions and support please join our [Slack Community](https://slack.babeljs.io/) (you can [sign up here](https://slack.babeljs.io/) for an invite), ask a question on [Stack Overflow](https://stackoverflow.com/questions/tagged/babeljs), or ping us on [Twitter](https://twitter.com/babeljs).

### Where are the docs?

Check out our website: [babeljs.io](https://babeljs.io/), and report issues/features at [babel/website](https://github.com/babel/website/issues).

### Want to report a bug or request a feature?

Please read through our [CONTRIBUTING.md](CONTRIBUTING.md) and fill out the issue template at [babel/issues](https://github.com/babel/babel/issues)!

### Want to contribute to Babel?

Check out:

- Our [#development](https://babeljs.slack.com/messages/development) Slack channel and say hi! ([sign-up](https://slack.babeljs.io))
- Issues with the [good first issue](https://github.com/babel/babel/labels/good%20first%20issue) and [help wanted](https://github.com/babel/babel/labels/help%20wanted) label. We suggest also looking at the [closed ones](https://github.com/babel/babel/issues?utf8=%E2%9C%93&q=is%3Aclosed+label%3A%22good+first+issue%22) to get a sense of the kinds of issues you can tackle.

Some resources:

- Our [CONTRIBUTING.md](CONTRIBUTING.md) to get started with setting up the repo.
- Our discussions/notes/roadmap: [babel/notes](https://github.com/babel/notes)
- Our progress on TC39 proposals: [babel/proposals](https://github.com/babel/proposals)
- Our blog which contains release posts and explanations: [/blog](https://babeljs.io/blog)
- Our videos page with talks about open source and Babel: [/videos](https://babeljs.io/videos)
- Our [podcast](https://podcast.babeljs.io)

### How is the repo structured?

The Babel repo is managed as a [monorepo](doc/design/monorepo.md) that is composed of many [npm packages](packages/README.md).

## License

[MIT](LICENSE)
