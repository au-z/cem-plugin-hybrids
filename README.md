# cem-plugin-hybrids

This is a repository for extending support for [Hybrids](https://github.com/hybridsjs/hybrids) Custom Elements in [@custom-elements-manifest/analyzer](https://github.com/open-wc/custom-elements-manifest).

### Install:

```bash
npm i -D @auzmartist/cem-plugin-hybrids
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
import { define } from 'hybrids';

export const MyElement = define({
  tag: 'my-element',
  str: '', // descriptor value shorthand
  num: 0,
  bool: false,
  noDefault: undefined, // omits type
  value: { value: 42 }, // plain value descriptor
  descriptor: {
    value: '', // assigns the empty string as default
    get: (host, val) => val,
    set: (host, val) => val,
  },
  getset: {
    get: (host, val = 'default') => val, // value initialize default
    set: (host, val) => val,
  },
  getter: (host) => host.noAttr.toUpperCase(), // omitted
  _private: '', // omits properties prefixed with '_'
  render: () => html`Hello World` // omitted
  content: () => html`Content` // omitted
});
```

Notably not supported yet are CustomEvents and slots.
This are the target of future improvements.

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
          "kind": "variable",
          "description": "",
          "name": "MyElement",
          "tag": "my-element",
          "members": [
            {
              "kind": "field",
              "name": "str",
              "type": {
                "text": "string"
              },
              "default": ""
            },
            {
              "kind": "field",
              "name": "num",
              "type": {
                "text": "number"
              },
              "default": "0"
            },
            {
              "kind": "field",
              "name": "bool",
              "type": {
                "text": "boolean"
              },
              "default": "false"
            },
            {
              "kind": "field",
              "name": "noDefault",
              "default": "undefined",
              "attribute": "no-default"
            },
            {
              "kind": "field",
              "name": "value",
              "type": {
                "text": "number"
              },
              "default": "42"
            },
            {
              "kind": "field",
              "name": "descriptor",
              "type": {
                "text": "string"
              },
              "default": ""
            },
            {
              "kind": "field",
              "name": "getset",
              "type": {
                "text": "string"
              },
              "default": "default"
            }
          ],
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
