#!/usr/bin/env node
'use strict';
const fs = require('fs');
const meow = require('meow');
const yaml = require('js-yaml');
const updateNotifier = require('update-notifier');
const interactive = require('./interactive.js');
const pkg = require('../package.json');
const capitana = require('.');

const notifier = updateNotifier({ pkg });

const cli = meow(`
	Usage
		capitana [stage] [microservices] [options]

	Options
		--break Stop execution on execution failure.
		--all  Execute program on all microservices.
		--except  Exclude [microservices] microservices from execution.

	Examples
		$ capitana deploy --all
			executes stage 'deploy' on all microservices
`);

let config;
try {
	config = yaml.safeLoad(fs.readFileSync('.capitanarc', 'utf8'));
} catch (e) {
	console.error(e);
	console.log('No .capitanarc file found. Exiting...');
	process.exit(1);
}

(async () => {
	let input = cli.input;
	let options = cli.flags;
	let stages = [];

	if (cli.flags.interactive) {
		let res = await interactive(config);
		stages = res.stages;
		input = res.input;
		options = { ...options, ...res.options };
	}
	else {
		stages = [input.shift()];
	}

	for (const stage of stages) {
		try {
			await capitana(stage, input, options, config);
		}
		catch (e) {
			console.error(e);
			break;
		}
	}

	notifier.notify();
})();
