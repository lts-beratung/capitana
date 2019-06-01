#!/usr/bin/env node
'use strict';
const meow = require('meow');
const yaml = require('js-yaml');
const fs   = require('fs');
const capitana = require('.');

const cli = meow(`
	Usage
	  $ capitana [input]

	Options
	  --foo  Lorem ipsum [Default: false]

	Examples
	  $ capitana
	  unicorns & rainbows
	  $ capitana ponies
	  ponies & rainbows
`);


let config;
try {
  config = yaml.safeLoad(fs.readFileSync('.capitanarc', 'utf8'));
} catch (e) {
	console.error(e);
	console.log("No .capitanarc file found. Exiting...");
	process.exit(1);
}

capitana(cli.input, cli.flags, config);
