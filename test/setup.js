import path from 'path';
import fs from 'fs';
import globby from 'globby';
import ts from 'typescript';

export async function loadFixtures(absPath, plugins = []) {
  let specs = fs.readdirSync(absPath).map((name) => ({ name }))

  return await Promise.all(specs.map(async (spec) => {
    const expectedPath = path.join(absPath, `${spec.name}/expected.json`)
    spec.expected = JSON.parse(fs.readFileSync(expectedPath, 'utf-8'))

    const packagePath = path.join(absPath, `${spec.name}/sourcecode`)
    const packagePathPosix = packagePath.split(path.sep).join(path.posix.sep)
    const globs = await globby(packagePathPosix)

    spec.modules = globs.map((glob) => {
      const relativeModulePath = `.${path.sep}${path.relative(process.cwd(), glob)}`
      const source = fs.readFileSync(relativeModulePath).toString()

      return ts.createSourceFile(path.parse(glob).base, source, ts.ScriptTarget.ES2015, true)
    })

    return spec
  }))
}