#!/bin/sh

set -e

echo "\n\n--- runit.sh: Clean files in /npm-package/ and /server/"
npm run clean --prefix npm-package
npm run clean --prefix server

echo "\n\n--- runit.sh: rebuild npm-package before server starts"
npm run build --prefix npm-package


echo "\n\n--- runit.sh: Run server for development:"
foreman start -f server/Procfile.dev
