# `@aegisjsproject/toast-message`

A modern, dependency-free <toast-message> web component powered by the Popover API

[![CodeQL](https://github.com/AegisJSProject/toast-message/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/AegisJSProject/toast-message/actions/workflows/codeql-analysis.yml)
![Node CI](https://github.com/AegisJSProject/toast-message/workflows/Node%20CI/badge.svg)
![Lint Code Base](https://github.com/AegisJSProject/toast-message/workflows/Lint%20Code%20Base/badge.svg)

[![GitHub license](https://img.shields.io/github/license/AegisJSProject/toast-message.svg)](https://github.com/AegisJSProject/toast-message/blob/master/LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/AegisJSProject/toast-message.svg)](https://github.com/AegisJSProject/toast-message/commits/master)
[![GitHub release](https://img.shields.io/github/release/AegisJSProject/toast-message?logo=github)](https://github.com/AegisJSProject/toast-message/releases)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/shgysk8zer0?logo=github)](https://github.com/sponsors/shgysk8zer0)

[![npm](https://img.shields.io/npm/v/@aegisjsproject/toast-message)](https://www.npmjs.com/package/@aegisjsproject/toast-message)
![node-current](https://img.shields.io/node/v/@aegisjsproject/toast-message)
![npm bundle size gzipped](https://img.shields.io/bundlephobia/minzip/@aegisjsproject/toast-message)
[![npm](https://img.shields.io/npm/dw/@aegisjsproject/toast-message?logo=npm)](https://www.npmjs.com/package/@aegisjsproject/toast-message)

[![GitHub followers](https://img.shields.io/github/followers/AegisJSProject.svg?style=social)](https://github.com/AegisJSProject)
![GitHub forks](https://img.shields.io/github/forks/AegisJSProject/toast-message.svg?style=social)
![GitHub stars](https://img.shields.io/github/stars/AegisJSProject/toast-message.svg?style=social)
[![Twitter Follow](https://img.shields.io/twitter/follow/shgysk8zer0.svg?style=social)](https://twitter.com/shgysk8zer0)

[![Donate using Liberapay](https://img.shields.io/liberapay/receives/shgysk8zer0.svg?logo=liberapay)](https://liberapay.com/shgysk8zer0/donate "Donate using Liberapay")
- - -

- [Code of Conduct](./.github/CODE_OF_CONDUCT.md)
- [Contributing](./.github/CONTRIBUTING.md)
<!-- - [Security Policy](./.github/SECURITY.md) -->

## Installation

Install via npm:

```bash
npm install @aegisjsproject/toast-message
```

## Usage

### Import Map with unpkg

You can use the component without a build step by utilizing an import map and a CDN like unpkg:

```html
<script type="importmap">
  {
    "imports": {
      "@aegisjsproject/toast-message": "https://unpkg.com/@aegisjsproject/toast-message@1.0.1/toast-message.min.js"
    }
  }
</script>
```

### Basic HTML Examples

#### 1. Declarative Usage

You can write the element directly in your HTML. Using the `autoshow` attribute will trigger it immediately when added to the DOM.

```html
<toast-message autoshow duration="5000" position="bottom-center" theme="dark">
	<span slot="content">Your profile has been updated successfully.</span>
</toast-message>
```

#### 2. Programmatic Usage

You can import the class and use its static methods to dynamically generate and display toasts from JavaScript.

```html
<button id="toast-btn" type="button">Show Toast</button>

<script type="module">
	import { HTMLToastMessageElement } from '@aegisjsproject/toast-message';

	document.getElementById('toast-btn').addEventListener('click', () => {
		HTMLToastMessageElement.toast('Action completed successfully!', {
			duration: 3000,
			position: 'top-end',
			theme: 'light',
			autoRemove: true
		});
	});
</script>
```
