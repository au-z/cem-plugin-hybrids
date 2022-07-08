# cem-plugin-hybrids

This is a repository for extending support for [Hybrids](https://github.com/hybridsjs/hybrids) Custom Elements in [@custom-elements-manifest/analyzer](https://github.com/open-wc/custom-elements-manifest).

## Usage

```js

```

### Install:

```bash
npm i -D cem-plugin-<pluginname>
```

### Import

`custom-elements-manifest.config.js`:

```js
import myPlugin from 'cem-plugin-template';

export default {
  plugins: [myPlugin()],
};
```

## Supported syntax

Document an example of the syntax your plugin supports

```js
export class MyElement extends HTMLElement {
  /**
   * @foo Some custom information!
   */
  message = '';
}
```

## Expected output

Document an example of the expected output custom elements manifest

```diff
{
  "schemaVersion": "0.1.0",
  "readme": "",
  "modules": [
    {
      "kind": "javascript-module",
      "path": "my-element.js",
      "declarations": [
        {
          "kind": "class",
          "description": "",
          "name": "MyElement",
          "members": [
            {
              "kind": "field",
              "name": "message",
              "default": "",
+             "foo": "Some custom information!"
            }
          ],
          "superclass": {
            "name": "HTMLElement"
          },
          "customElement": true
        }
      ],
      "exports": [
        {
          "kind": "js",
          "name": "MyElement",
          "declaration": {
            "name": "MyElement",
            "module": "my-element.js"
          }
        }
      ]
    }
  ]
}
```
