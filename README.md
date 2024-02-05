<p align="center">
	<img alt="Eagle Eye" height="150px" src="docs/eagle-eye.png" width="250px" />
</p>
<p align="center">
	<a href="https://typescriptlang.org">
		<img alt="TypeScript" src="https://badgen.net/badge/icon/typescript?icon=typescript&label">
	</a>
	<a href="https://github.com/webKrafters/react-observable-context/actions">
		<img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/webKrafters/react-observable-context/test.yml">
	</a>
	<a href="https://coveralls.io/github/webKrafters/react-observable-context">
		<img alt="coverage" src="https://img.shields.io/coveralls/github/webKrafters/react-observable-context">
	</a>
	<img alt="NPM" src="https://img.shields.io/npm/l/@webkrafters/react-observable-context">
	<img alt="Maintenance" src="https://img.shields.io/maintenance/yes/2032">
	<img alt="build size" src="https://img.shields.io/bundlephobia/minzip/@webkrafters/react-observable-context?label=bundle%20size">
	<a href="https://www.npmjs.com/package/@webKrafters/react-observable-context">
		<img alt="Downloads" src="https://img.shields.io/npm/dt/@webkrafters/react-observable-context.svg">
	</a>
	<img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/webKrafters/react-observable-context">
</p>

# React-Observable-Context [Eagle Eye]

<ul>
	<li> Update-friendly context.</li>
	<li> A context bearing an observable consumer <a href="https://eagleeye.js.org/concepts/store">store</a>.</li>
	<li> Recognizes <b>negative array indexing</b>. Please see <a href="https://eagleeye.js.org/concepts/property-path">Property Path</a> and <code>store.setState</code> <a href="https://eagleeye.js.org/concepts/store/setstate/indexing">Indexing</a>.</li>
	<li> Only re-renders subscribing components (<a href="https://eagleeye.js.org/concepts/client">clients</a>) on context state changes.</li>
	<li> Subscribing component decides which context state properties' changes to trigger its update.</li>
</ul>

**Name:** React-Observable-Context

**Moniker:** Eagle Eye

**Usage:** Please see <b><a href="https://eagleeye.js.org/getting-started">Getting Started</a></b>.

**Demo:** [Play with the app on codesandbox](https://codesandbox.io/s/github/webKrafters/react-observable-context-app)\
If sandbox fails to load app, please refresh dependencies on its lower left.

**Install:**\
npm i -S @webkrafters/react-observable-context\
npm install --save @webkrafters/react-observable-context

May also see <b><a href="https://eagleeye.js.org/changes">What's Changed?</a></b>.

## Please see full documentation here:
**[eagleeye.js.org](https://eagleeye.js.org)**

# License

MIT
