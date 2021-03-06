'use strict';
const execa = require('execa');
const ora = require('ora');
const chalk = require('chalk');

const allowedGlobalVariables = [
	'all',
	'break',
	'config',
	'except',
	'full',
	'interactive',
	'list',
	'spinner',
	'verbose',
	'warnings'
];

module.exports = async (stage, input, options = {}, config) => {
	const configMicroservices = Object.keys(config.microservices);
	let microservices;

	microservices = input;

	assertStageIsValid(config, stage);
	assertMicroservicesAreValid(microservices, configMicroservices);
	setDefaults(config, options);
	assertVariablesAreValid(config, options);

	if (options.except === true) {
		microservices = getArrayDifference(configMicroservices, microservices);
	} else if (options.all === true) {
		microservices = configMicroservices;
	}

	const {variables} = config.stages[stage];
	if (variables && !isSubset(variables, Object.keys(options))) {
		throw new Error(`Not enough variables provided for stage "${stage}". Needed:
  "${variables}".`);
	}

	if (options.spinner === false) {
		console.log(`Beginning to work on stage ${stage}`);
	} else {
		console.log(chalk`Beginning to work on stage {green.bold ${stage}}`);
	}

	const originalStageScript = config.stages[stage].run;
	for (const microservice of microservices) {
		let spinner;
		if (options.spinner === false) {
			console.log(`Working on stage ${stage} on microservice ${microservice}...`);
		} else {
			spinner = ora(chalk`Working on stage {green.bold ${stage}} on microservice {red.bold ${microservice}}...`).start();
		}

		if (!isStageAllowed(config, microservice, stage)) {
			if (options.spinner === false) {
				console.warn('  Skipped: Stage not allowed');
			} else {
				spinner.warn(chalk`Working on stage {green.bold ${stage}} on microservice {red.bold ${microservice}}... {yellow.bold Skipped}: Stage not allowed`);
			}

			continue;
		}

		const stageScript = interpolateVariables(originalStageScript, microservice, options);
		let {cwd} = config.stages[stage];
		if (cwd) {
			cwd = interpolateVariables(cwd, microservice, options);
		}

		try {
			/* eslint-disable-next-line no-await-in-loop */
			const {stdout, stderr} = await processStage(stageScript, cwd);
			if (stderr) {
				if (options.warnings === false) {
					throw new Error(stderr);
				}
			}

			if (options.spinner !== false) {
				spinner = setSpinnerStatus(stderr, options, spinner);
			}

			if (stdout) {
				if (options.verbose === true) {
					console.log(stdout);
				}
			}

			if (stderr) {
				console.error(stderr);
			}
		} catch (error) {
			if (options.spinner !== false) {
				spinner.fail();
			}

			logError(error, options);

			if (options.break === true) {
				throw new Error('Aborting execution: --break set to true');
			}
		}
	}

	console.log('');
};

function logError(error, options) {
	const {stdout, stderr} = error;
	if (stdout && options.verbose === true) {
		console.log(stdout);
	}

	if (stderr) {
		console.error(stderr);
	}

	if (!stderr && !stdout && error) {
		console.error(error);
	}
}

function setSpinnerStatus(stderr, options, spinner) {
	if (stderr) {
		if (options.warnings === false) {
			return spinner.fail();
		}

		return spinner.warn();
	}

	return spinner.succeed();
}

function assertStageIsValid(config, stage) {
	const stages = Object.keys(config.stages);
	if (!stages.includes(stage)) {
		throw new Error(`Stage "${stage}" not included in the ones specified in the config file:
  "${Object.keys(config.stages)}".`);
	}
}

function isStageAllowed(config, microservice, stage) {
	const microserviceObject = config.microservices[microservice];
	return !(microserviceObject && microserviceObject.allowedStages && !microserviceObject.allowedStages.includes(stage));
}

function assertMicroservicesAreValid(microservices, configMicroservices) {
	if (!isSubset(microservices, configMicroservices)) {
		throw new Error(`Microservices "${microservices}" don't match with the ones specified in the config file:
  "${configMicroservices}".`);
	}
}

function assertVariablesAreValid(config, options) {
	const confVariables = config.variables ? Object.keys(config.variables) : [];
	const currentVariables = options ? Object.keys(options) : [];

	const allVariables = confVariables.concat(allowedGlobalVariables);
	if (!isSubset(currentVariables, allVariables)) {
		throw new Error(`Variables "${currentVariables}" don't match with the ones specified in the config file:
  "${allVariables}".`);
	}

	for (const vari of currentVariables) {
		const allowedValues = config.variables ? config.variables[vari] : undefined;
		if (allowedValues && !allowedValues.includes(`${options[vari]}`)) {
			throw new Error(`Value "${options[vari]}" of variable "${vari}" not allowed. Allowed:
  "${allowedValues}".`);
		}
	}
}

function setDefaults(config, options) {
	if (!config.variables || !config.variables.defaults) {
		return;
	}

	const defaults = Object.keys(config.variables.defaults);

	for (const vari of defaults) {
		if (options[vari]) {
			continue;
		}

		options[vari] = config.variables.defaults[vari];
	}
}

function interpolateVariables(string, microservice, options) {
	string = string.replace('$MICROSERVICE', microservice);
	for (const key of Object.keys(options)) {
		string = string.replace('$' + key, options[key]);
	}

	return string;
}

function isSubset(subset, set) {
	return subset.every(val => set.includes(val));
}

function getArrayDifference(minuend, substrahend) {
	return minuend.filter(x => !substrahend.includes(x));
}

function processStage(stageScript, cwd) {
	return execa('/bin/sh', ['-c', stageScript], {cwd});
}
