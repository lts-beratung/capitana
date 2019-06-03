'use strict';
const prompts = require('prompts');

module.exports = async config => {
	const stages = Object.keys(config.stages);
	const stagesObj = stages.map(i => ({title: i, value: i}));

	const {selectedStages} = await prompts(
		[
			{
				type: 'multiselect',
				name: 'selectedStages',
				message: 'Pick stages to work with',
				choices: stagesObj,
				min: 1,
				hint: '- Space to select. Return to submit'
			}
		]
	);

	const microservices = Object.keys(config.microservices);
	const microservicesObj = microservices.map(i => ({title: i, value: i}));

	const {selectedMicroservices} = await prompts(
		[
			{
				type: 'multiselect',
				name: 'selectedMicroservices',
				message: 'Pick microservices to work with',
				choices: microservicesObj,
				min: 1,
				hint: '- Space to select. Return to submit'
			}
		]
	);

	const neededVars = getNeededVariables(selectedStages, config);

	const allVariables = {};
	for (const vari of neededVars) {
		if (vari) {
			const values = config.variables[vari];
			const valuesObj = values.map(i => ({title: i, value: i}));
			/* eslint-disable no-await-in-loop */
			const {selectedVariable} = await prompts(
				[
					{
						type: 'select',
						name: 'selectedVariable',
						message: `Pick the value of variable "${vari}":`,
						choices: valuesObj
					}
				]
			);
			allVariables[vari] = selectedVariable;
		}
	}
	return {stages: selectedStages, input: selectedMicroservices, options: allVariables};
};

function getNeededVariables(selectedStages, config) {
	let neededVars = [];
	for (const stage of selectedStages) {
		if (config.stages[stage].variables) {
			const newVars = config.stages[stage].variables.filter(i => !neededVars.includes(i));
			neededVars = neededVars.concat(newVars);
		}
	}
	return neededVars;
}

