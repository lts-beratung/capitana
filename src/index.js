'use strict';
const execa = require('execa');
const ora = require('ora');
const chalk = require('chalk');

module.exports = async (stage, input, options = {}, config) => {
	const configMicroservices = Object.keys(config.microservices);
	let microservices;

	microservices = input;

	assertStageIsValid(config, stage);
	assertMicroservicesAreValid(microservices, configMicroservices);
	assertVariablesAreValid(config, options);

	if (options.except === true) {
		microservices = getArrayDifference(configMicroservices, microservices);
	} else if (options.all === true) {
		microservices = configMicroservices;
	}

	const { variables } = config.stages[stage];
	if (variables && !isSubset(variables, Object.keys(options))) {
		throw new Error(`Not enough variables provided for stage "${stage}". Needed:
  "${variables}".`);
	}

	console.log(chalk`Beginning to work on stage {green.bold ${stage}}`);
	const originalStageScript = config.stages[stage].run;
	for (const microservice of microservices) {
		const spinner = ora(chalk`Working on stage {green.bold ${stage}} on microservice {red.bold ${microservice}}...`).start();

		if (!isStageAllowed(config, microservice, stage)) {
			spinner.warn(chalk`Working on stage {green.bold ${stage}} on microservice {red.bold ${microservice}}... {yellow.bold Skipped}: Stage not allowed`);
			continue;
		}

		const stageScript = interpolateVariables(originalStageScript, microservice, options);
		let { cwd } = config.stages[stage];
		cwd = interpolateVariables(cwd, microservice, options);
		try {
			/* eslint-disable no-await-in-loop */
			const { stdout, stderr } = await processStage(stageScript, cwd);
			if (stderr) {
				spinner.fail();
				if (options.verbose === true) {
					console.log(stderr);
				}
				if (options.break === true) {
					break;
				}
			} else {
				spinner.succeed();
				if (options.verbose === true) {
					console.log(stdout);
				}
			}
		} catch (error) {
			spinner.fail();
			if (options.verbose === true) {
				console.log(error);
			}
			if (options.break === true) {
				break;
			}
		}
	}
	console.log("");
};

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
	const confVariables = Object.keys(config.variables);
	const currentVariables = Object.keys(options);
	const allVariables = confVariables.concat(['except', 'all', 'verbose', 'break', 'interactive']);
	if (!isSubset(currentVariables, allVariables)) {
		throw new Error(`Variables "${currentVariables}" don't match with the ones specified in the config file:
  "${allVariables}".`);
	}
	for (const vari of currentVariables) {
		const allowedValues = config.variables[vari];
		if (allowedValues && !allowedValues.includes(`${options[vari]}`)) {
			throw new Error(`Value "${options[vari]}" of variable "${vari}" not allowed. Allowed:
  "${allowedValues}".`);
		}
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
	return execa('/bin/sh', ['-c', stageScript], { cwd });
}
