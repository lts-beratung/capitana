import test from 'ava';
import execa from 'execa';
import loadJsonFile from 'load-json-file';
import writeJsonFile from 'write-json-file';

test('no warnings flag', async t => {
	await genericTest(
		'test/no-warnings',
		['push', '--all', '--no-warnings', '--break'], t);
});

test('stderr logging after stdout', async t => {
	await genericTest(
		'test/stderr-logging-after-stdout',
		['push', '--all'], t);
});

test('listAllowed flag generic test', async t => {
	await genericTest(
		'test/list-allowed',
		['--listAllowed', 'gateway'], t);
});

test('listAllowed flag with allowedStages restriction', async t => {
	await genericTest(
		'test/list-allowed-restricted',
		['--listAllowed', 'transceiver'], t);
});

test('two config files', async t => {
	await genericTest(
		'test/two-config-files',
		['--config', 'no-deploy.capitanarc', '--full', '--all'], t);
});

async function genericTest(path, args, t, write) {
	let stderr;
	let stdout;
	try {
		({stdout, stderr} =
			await execa('node', [`${__dirname}/../src/cli.js`].concat(args), {cwd: path}));
	} catch (error) {
		({stdout, stderr} = error);
	}

	if (write === true) {
		await writeJsonFile(path + '/result.json', {stdout, stderr});
	}

	const result = await loadJsonFile(path + '/result.json');
	t.is(stdout, result.stdout);
	t.is(stderr, result.stderr);
}

