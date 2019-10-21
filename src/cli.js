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
		--all  Execute program on all microservices.
		--break Stop execution on execution failure.
		--config filePath Specifies a different config file to use
		--except  Exclude [microservices] microservices from execution.
		--full  Executes all stages on the selected microservices.
		--help  Show this message and exit.
		--interactive Executes capitana interactively.
		--list [variables|microservices|stages] List configured variables.
		--listAllowed microservice Lists the stages the microservice is allowed to run through.
		--no-spinner Disables spinner. Useful for non-unicode terminals.
		--no-warnings Treats all stderr as an error and not a warning.
		--verbose  Execute program on all microservices.
	Examples
	$ capitana deploy --all
		executes stage 'deploy' on all microservices
	$ capitana --full database
		executes all stages on microservice 'database'
`);

let config;
try {
	let configFileName = '.capitanarc';
	if (cli.flags.config) {
		configFileName = cli.flags.config;
	}

	config = yaml.safeLoad(fs.readFileSync(configFileName, 'utf8'));
} catch (error) {
	console.error(error);
	console.log('No valid configuration file found. Exiting...');
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

if (cli.flags.listAllowed) {
	const microserviceName = cli.flags.listAllowed;
	const stages = Object.keys(config.stages);
	if (!Object.keys(config.microservices).includes(microserviceName)) {
		console.error(`Microservice "${microserviceName}" not found.`);
		console.error('Available microservices:');
		logArray(Object.keys(config.microservices));
	}

	const microservice = config.microservices[microserviceName];
	for (let i = 0; i < stages.length; i++) {
		const stage = stages[i];
		if (!microservice || !microservice.allowedStages || microservice.allowedStages.includes(stage)) {
			console.log(stage);
		}
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
