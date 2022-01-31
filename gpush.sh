#!/usr/bin/env sh

set -e
cd server; bundle exec rspec; cd ..
cd npm-package; npm test; cd ..
git push
