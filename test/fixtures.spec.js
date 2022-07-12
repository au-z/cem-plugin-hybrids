import { create } from '@custom-elements-manifest/analyzer/src/create.js';
import path from 'path';
import { describe, expect, it } from 'vitest';
import CemPluginHybrids from '../src/index.js';
import { loadFixtures } from './setup.js';

describe.only('basic component properties', async () => {
  const fixtures = await loadFixtures(path.resolve(__dirname, 'fixtures'))
  console.log(fixtures[0])

  fixtures.forEach(({ name, modules, expected }) => {
    it(`Test: ${name}`, () => {
      const result = create({ modules, plugins: [CemPluginHybrids()], context: { dev: 'true' } })
      expect(result).toMatchObject(expected)
    })
  })
})

