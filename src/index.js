'use strict';
const execa = require('execa');
const ora = require('ora');
const chalk = require('chalk');

module.exports = async (input, options = {}, config) => {
	const stage = input.shift();

	const configMicroservices = Object.keys(config.microservices);
	let microservices;

	microservices = input;
	if (options["except"] === true) {
		microservices = getArrayDifference(configMicroservices, microservices);
	} else if (options["all"] === true) {
		microservices = configMicroservices;
	}

	let originalStageScript = config.stages[stage].run;
	for (const microservice of microservices) {
		const spinner = ora(chalk`Working on stage {green.bold ${stage}} on microservice {red.bold ${microservice}}...`).start();

		const stageScript = interpolateVariables(originalStageScript, microservice, options);
		let cwd = config.stages[stage].cwd;
		cwd = interpolateVariables(cwd, microservice, options);
		try {
			const { stdout, stderr } = await processStage(stageScript, cwd);
			if (stderr) {
				spinner.fail();
				console.error(stderr);
			}
			else {
				spinner.succeed();
				if (options["verbose"] === true) {
					console.log(stdout);
				}

			}
		}
		catch (error) {
			spinner.fail();
			console.error(error);
		}
	}
};

function interpolateVariables(string, microservice, options) {
	string = string.replace("$MICROSERVICE", microservice);
	for (const key of Object.keys(options)) {
		string = string.replace("$" + key, options[key]);
	}
	return string;
}

function getArrayDifference(minuend, substrahend) {
	return minuend.filter(x => !substrahend.includes(x));
}

function processStage(stageScript, cwd) {
	return execa("/bin/sh", ["-c", stageScript], { cwd: cwd });
}

