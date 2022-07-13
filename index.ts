import Bluebird from 'bluebird';
import { writeFileSync } from 'fs';

const writeFile = Bluebird.promisify(writeFileSync);
Bluebird.config({
	// Enable cancellation
	cancellation: true,
});

type Pattern = {
	blinks: number;
	onDuration: number;
	offDuration: number;
	pause: number;
};

const arrayOf = (length: number) => Array.from(Array(length));

// Helps in blinking the LED from the given end point.
export = (ledFile: string) => {
	const ledOn = () => writeFile(ledFile, '1', null);
	const ledOff = () => writeFile(ledFile, '0', null);

	const blink = (ms: number = 200) => {
		ms ??= 200;
		return ledOn().delay(ms).then(ledOff);
	};

	let blinking: null | Bluebird<void> = null;
	const start = (pattern: Pattern): Bluebird<void> =>
		Bluebird.resolve(arrayOf(pattern.blinks))
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
			ledOff();
			blinking = null;
		},
	};

	return blink;
};
