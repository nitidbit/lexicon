#! /usr/bin/env bash
# executed by render.com: Settings > Build Command

echo "=== render_build./.sh: building Lexicon NPM package first ==="
cd ../npm-package
npm i
npm run tsc

echo "=== render_build./.sh: installing yarn ==="
cd ../server
npm i -g yarn

echo "=== render_build./.sh: yarn install ==="
yarn

echo "=== render_build./.sh: bundle install ==="
bundle install

echo "=== render_build./.sh: precompling Rails assets ==="
bundle exec rake assets:precompile assets:clean db:migrate
