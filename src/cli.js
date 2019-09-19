#!/usr/bin/env node
'use strict';
const fs = require('fs');
const meow = require('meow');
const yaml = require('js-yaml');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
const interactive = require('./interactive.js');
const capitana = require('.');

const notifier = updateNotifier({pkg});

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
} catch (error) {
	console.error(error);
	console.log('No .capitanarc file found. Exiting...');
	process.exit(1);
}

if (cli.flags.list) {
	const listFlag = cli.flags.list;
	switch (listFlag) {
		case 'variables':
			logArray(Object.keys(config.variables));
			break;
		case 'microservices':
			logArray(Object.keys(config.microservices));
			break;
		case 'stages':
			logArray(Object.keys(config.stages));
			break;
		default:
			throw new Error(`Value "${listFlag}" for flag "list" not valid. Allowed ones are:
				"${['variables', 'microservices', 'stages']}".`);
	}

	process.exit(0);
}

function logArray(array) {
	for (const element of array) {
		console.log(element);
	}
}

(async () => {
	let {input} = cli;
	let options = cli.flags;
	let stages = [];

	if (cli.flags.interactive) {
		const res = await interactive(config);
		({
			stages,
			input
		} = res);
		options = {...options, ...res.options};
	} else if (cli.flags.full) {
		stages = Object.keys(config.stages);
	} else {
		stages = [input.shift()];
	}

	for (const stage of stages) {
		try {
			/* eslint-disable-next-line no-await-in-loop */
			await capitana(stage, input, options, config);
		} catch (error) {
			console.error(error);
			process.exit(1);
		}
	}

	notifier.notify();
})();
