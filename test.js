import test from 'ava';
import capitana from '.';

test('title', t => {
	const err = t.throws(() => {
		capitana(123);
	}, TypeError);
	t.is(err.message, 'Expected a string, got number');

	t.is(capitana('unicorns'), 'unicorns & rainbows');
});
