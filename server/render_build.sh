#! /usr/bin/env bash
# executed by render.com: Settings > Build Command

echo "====== render_build.sh: building Lexicon NPM package first: typescript -> JS ======"
cd ../npm-package
npm i
npm run build

echo "====== render_build.sh: for install server NPM packages ======"
cd ../server
npm i

echo "====== render_build.sh: server bundle install ======"
bundle install

echo "====== render_build.sh: precompling Rails assets ======"
bundle exec rake assets:precompile assets:clean db:migrate
