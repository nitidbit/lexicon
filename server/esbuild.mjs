/*
  Configuraion for ESBuild

  usage:
    npm run build
    npm run build -- --watch
    npm run build -- --analyze
 */

import { readdir } from "node:fs/promises";
import esbuild from "esbuild";
import sassPlugin from "esbuild-plugin-sass";
import { livereloadPlugin } from "@jgoz/esbuild-plugin-livereload";
import fs from "node:fs";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const RESET = "\x1b[39m";

const esbuildOptions = {
  entryPoints: await entryPoints(),
  bundle: true,
  outdir: "app/assets/builds",
  sourcemap: "linked",
  plugins: [sassPlugin()],
};

// Which JS/TS/SCSS files should be entry-points?
async function entryPoints() {
  const JS_DIR = "app/javascript/";
  const dirCont = await readdir(JS_DIR);
  const results = dirCont
    .filter((filename) => filename.match(/\.(js|jsx|ts|tsx)$/gi))
    .map((filename) => JS_DIR + filename);
  console.log(
    "esbuild.mjs: entryPoints, i.e. bundles that will be built =",
    results,
  );
  return results;
}

// When in watch mode, tell me when a build has happened.
const pluginNotifyWhenBuilding = {
  name: "pluginNotifyWhenBuilding",
  setup(build) {
    build.onEnd((result) => {
      const numErrors = result.errors.length;
      const color = numErrors ? RED : GREEN;
      console.log(
        `${color}esbuild.mjs: build done with ${result.errors.length} errors`,
        RESET,
      );
    });
  },
};

async function build() {
  console.log("esbuild.mjs: building...");
  console.log(await esbuild.build(esbuildOptions));
  console.log("esbuild.mjs: building...DONE");
  console.log("esbuild.mjs: bundles in:", esbuildOptions.outdir);
}

async function buildWatchMode() {
  console.log("esbuild.mjs: watching...");

  esbuildOptions.plugins.push(pluginNotifyWhenBuilding);
  esbuildOptions.plugins.push(
    livereloadPlugin({ fullReloadOnCssUpdates: true }),
  );

  let esBuildResult = await esbuild.context(esbuildOptions);
  await esBuildResult.watch();
}

// Creates a metafile which can be analyzed to see how much space in the ESBuild package is taken up
// by various libraries. E.g. we want Lodash to be about 100kb.
async function analyze() {
  const METAFILE_FILENAME = "/tmp/lexicon-esbuild-meta.json";
  console.log("esbuild.mjs: analyzing...");
  esbuildOptions.metafile = true;
  let esBuildResult = await esbuild.build(esbuildOptions);
  fs.writeFileSync(METAFILE_FILENAME, JSON.stringify(esBuildResult.metafile));
  console.log("esbuild.mjs: analyzing...DONE");
  console.log(
    "esbuild.mjs: metafile:",
    METAFILE_FILENAME,
    "  Use it here: https://esbuild.github.io/analyze/",
  );
}

if (process.argv.includes("--watch")) buildWatchMode();
else if (process.argv.includes("--analyze")) analyze();
else build();
