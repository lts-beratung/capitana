import test from 'ava';
import execa from 'execa';
import loadJsonFile from 'load-json-file';
// Import writeJsonFile from 'write-json-file';

test('no warnings flag', async t => {
	await genericTest(
		'test/no-warnings',
		['push', '--all', '--no-warnings', '--break'], t);
});

async function genericTest(path, args, t) {
	const {stdout, stderr} = await execa('capitana', args, {cwd: path});
	console.log(stdout);
	// Await writeJsonFile(path + '/result.json', { stdout, stderr });
	const result = await loadJsonFile(path + '/result.json');
	t.is(stdout, result.stdout);
	t.is(stderr, result.stderr);
}

