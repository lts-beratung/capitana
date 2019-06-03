'use strict';
const execa = require('execa');
const ora = require('ora');
const chalk = require('chalk');

module.exports = async (input, options = {}, config) => {
	const stage = input.shift();

	const configMicroservices = Object.keys(config.microservices);
	let microservices;

	microservices = input;

	if (!areMicroservicesValid(microservices, configMicroservices)) {
		return;
	}

	if (!areVariablesValid(config, options)) {
		return;
	}

	if (options.except === true) {
		microservices = getArrayDifference(configMicroservices, microservices);
	} else if (options.all === true) {
		microservices = configMicroservices;
	}

	const variables = config.stages[stage].variables;
	if(variables && !isSubset(variables, Object.keys(options)))
	{
		console.error(chalk`{red.bold Error}: Not enough variables provided for stage "${stage}". Needed:
  "${variables}".`);
		return;
	}

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
};

function isStageAllowed(config, microservice, stage) {
	const microserviceObject = config.microservices[microservice];
	return !(microserviceObject && microserviceObject.allowedStages && !microserviceObject.allowedStages.includes(stage))
}

function areMicroservicesValid(microservices, configMicroservices) {
	if (!isSubset(microservices, configMicroservices)) {
		console.error(chalk`{red.bold Error}: Microservices "${microservices}" don't match with the ones specified in the config file:
  "${configMicroservices}".`);
		return false;
	}
	return true;
}

function areVariablesValid(config, options) {
	const confVariables = Object.keys(config.variables);
	const currentVariables = Object.keys(options);
	const allVariables = confVariables.concat(["except", "all", "verbose", "break"]);
	if (!isSubset(currentVariables, allVariables)) {
		console.error(chalk`{red.bold Error}: Variables "${currentVariables}" don't match with the ones specified in the config file:
  "${allVariables}".`);
		return false;
	}
	for (const vari of currentVariables) {
		const allowedValues = config.variables[vari];
		if(allowedValues && !allowedValues.includes(`${options[vari]}`))
		{
			console.error(chalk`{red.bold Error}: Value "${options[vari]}" of variable "${vari}" not allowed. Allowed:
  "${allowedValues}".`);
			return false;
		}
	}


	return true;
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
