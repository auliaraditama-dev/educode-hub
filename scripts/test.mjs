// Run pure data tests without subprocesses or a platform-specific transpiler.
import ts from "typescript";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
const sources = [
  "src/lib/content.ts",
  "src/lib/progress.ts",
  "tests/progress.test.ts",
  "src/lib/practice.ts",
  "tests/practice.test.ts",
  "src/lib/safety.ts",
  "tests/safety.test.ts",
];
for (const file of sources) {
  const output = resolve(".unit-tests", file.replace(/\.ts$/, ".js"));
  await mkdir(dirname(output), { recursive: true });
  const source = await readFile(file, "utf8");
  const result = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
  });
  await writeFile(output, result.outputText);
}
await import(pathToFileURL(resolve(".unit-tests/tests/progress.test.js")).href);

await import(pathToFileURL(resolve(".unit-tests/tests/practice.test.js")).href);
await import(pathToFileURL(resolve("tests/service-worker.test.mjs")).href);

await import(pathToFileURL(resolve(".unit-tests/tests/safety.test.js")).href);
