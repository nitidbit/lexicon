#!/usr/bin/env sh

#   Refresh things from time to time

# from https://stackoverflow.com/questions/59895/how-do-i-get-the-directory-where-a-bash-script-is-located-from-within-the-script
HERE=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

echo "refresh.sh: === install NPM packages for /npm-package/ folder ==="
cd $HERE/npm-package
npm i

echo "refresh.sh: === install NPM and Bundler packages for /server/ folder ==="
cd $HERE/server
bundle
npm i

