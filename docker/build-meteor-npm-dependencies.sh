#!/bin/bash

set -o errexit

printf "\n[-] Installing Meteor application server NPM dependencies...\n\n"

cd $APP_BUNDLE_FOLDER/bundle/programs/server/
ls -a
npm install
npm uninstall fibers
npm install fibers
npm rebuild
/usr/local/bin/node /opt/bundle/bundle/programs/server/node_modules/fibers/build

if [[ "$1" = '--build-from-source' ]]; then
	npm rebuild --build-from-source
	cd $APP_BUNDLE_FOLDER/bundle/programs/server/npm
	npm rebuild --build-from-source
fi
