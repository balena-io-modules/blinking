import { promises as fs } from 'fs';

// TODO: it would be better to import setTimeout from timers/promises however that does not work with the fakeTimer we use in tests.
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Pattern = {
	blinks: number;
	onDuration: number;
	offDuration: number;
	pause: number;
};

// Helps in blinking the LED from the given end point.
export = (ledFile: string) => {
	const ledOn = () => fs.writeFile(ledFile, '1');
	const ledOff = () => fs.writeFile(ledFile, '0');

	const doBlink = async (ms: number, isCancelled?: () => boolean) => {
		if (isCancelled?.()) {
			return true;
		}
		await ledOn();
		await delay(ms);
		if (isCancelled?.()) {
			return true;
		}
		await ledOff();
	};

	const blink = async (ms = 200) => {
		ms ??= 200;
		await doBlink(ms);
	};

	let blinkingCancel: (() => void) | undefined;
	const start = async (
		pattern: Pattern,
		isCancelled: () => boolean,
	): Promise<void> => {
		for (let i = 0; i < pattern.blinks; i++) {
			if (await doBlink(pattern.onDuration, isCancelled)) {
				return;
			}
			await delay(pattern.offDuration);
		}
		await delay(pattern.pause);
		void start(pattern, isCancelled);
	};

	blink.pattern = {
		start(pattern: Partial<Pattern> = {}) {
			pattern ??= {};
			if (blinkingCancel != null) {
				return false;
			}
			const fullPattern = {
				blinks: pattern.blinks ?? 1,
				onDuration: pattern.onDuration ?? 200,
				offDuration: pattern.offDuration ?? 200,
				pause: pattern.pause ?? 0,
			};
			let cancelled = false;
			blinkingCancel = () => {
				cancelled = true;
			};
			void start(fullPattern, () => cancelled);
		},
		stop() {
			if (blinkingCancel == null) {
				return false;
			}
			blinkingCancel();
			void ledOff();
			blinkingCancel = undefined;
		},
	};

	return blink;
};
