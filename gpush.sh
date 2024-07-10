#!/usr/bin/env sh

set -e

# from https://stackoverflow.com/questions/59895/how-do-i-get-the-directory-where-a-bash-script-is-located-from-within-the-script
HERE=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

pushd $HERE/server; bundle exec rspec; popd
pushd $HERE/npm-package; npm test; popd
git push
