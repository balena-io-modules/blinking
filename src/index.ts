import Promise from 'bluebird';
import { writeFile } from 'fs';

const writeFileAsync = Promise.promisify(writeFile);
Promise.config({
	// Enable cancellation
	cancellation: true,
});

type Pattern = {
	blinks: number;
	onDuration: number;
	offDuration: number;
	pause: number;
};

const numToArray = (n: number) => {
	const r = new Array(n);
	for (let i = 0; i < n; i++) {
		r[i] = undefined;
	}
	return r;
};

// Helps in blinking the LED from the given end point.
export = (ledFile: string) => {
	const ledOn = () => writeFileAsync(ledFile, '1');
	const ledOff = () => writeFileAsync(ledFile, '0');

	const blink = (ms: number = 200) => {
		ms ??= 200;
		return ledOn().delay(ms).then(ledOff);
	};

	let blinking: null | Promise<void> = null;
	const start = (pattern: Pattern): Promise<void> =>
		Promise.resolve(numToArray(pattern.blinks))
			.each(() => blink(pattern.onDuration).delay(pattern.offDuration))
			.delay(pattern.pause)
			.then(() => start(pattern));

	blink.pattern = {
		start(pattern: Partial<Pattern> = {}) {
			pattern ??= {};
			if (blinking != null) {
				return false;
			}
			const fullPattern = {
				blinks: pattern.blinks ?? 1,
				onDuration: pattern.onDuration ?? 200,
				offDuration: pattern.offDuration ?? 200,
				pause: pattern.pause ?? 0,
			};
			blinking = start(fullPattern);
		},
		stop() {
			if (blinking == null) {
				return false;
			}
			blinking.cancel();
			void ledOff();
			blinking = null;
		},
	};

	return blink;
};
