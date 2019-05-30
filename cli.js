#!/usr/bin/env node
'use strict';
const meow = require('meow');
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

console.log(capitana(cli.input[0] || 'unicorns'));
