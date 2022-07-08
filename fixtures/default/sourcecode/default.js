import { define } from 'hybrids';

const composed = {
  str: '',
  num: 0,
  bool: false,
};

export const MyElement = define({
  tag: 'my-element',
  ...composed,
  noDefault: undefined,
  value: { value: 42 },
  descriptor: {
    value: '',
    get: (host, val) => val,
    set: (host, val) => val,
  },
  getset: {
    get: (host, val = 'default') => val,
    set: (host, val) => val,
  },
  getter: (host) => host.noAttr.toUpperCase(),
});
