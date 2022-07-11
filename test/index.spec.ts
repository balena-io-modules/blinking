import { expect } from 'chai';
import mockFs from 'mock-fs';
import { useFakeTimers, SinonFakeTimers } from 'sinon';
import { promises as fs } from 'fs';

import blinking from '../index';

describe('blinking', () => {
    const LED_FILE_PATH = '/sys/class/leds/led0/brightness';
    let clock: SinonFakeTimers;
    const blink = blinking(LED_FILE_PATH);

    const expectValue = async (path: string, expected: string) =>
        expect(await fs.readFile(path, 'utf-8')).to.equal(expected);
    const expectLedTurnedOn = async () => await expectValue(LED_FILE_PATH, '1');
    const expectLedTurnedOff = async () => await expectValue(LED_FILE_PATH, '0');

    beforeEach(() => {
        clock = useFakeTimers();
        mockFs({
            [LED_FILE_PATH]: '0'
        });
        
    });

    afterEach(() => {
        mockFs.restore();
        clock.restore();
    });

    it('blinks with default pattern', async () => {
        blink.pattern.start();
        await clock.tickAsync(1);
        await expectLedTurnedOn();
        await clock.tickAsync(200);
        await expectLedTurnedOff();
        blink.pattern.stop();
    });

    it('cancels blink on calling stop', async () => {
        blink.pattern.start();
        await clock.tickAsync(1);
        await expectLedTurnedOn();
        blink.pattern.stop();
        await clock.tickAsync(1);
        await expectLedTurnedOff();
    });

    it('blinks with custom pattern', async () => {
        const pattern = {
            blinks: 3,
            onDuration: 500,
            offDuration: 300,
            pause: 100
        };
        const expectPattern = async () => {
            for (let i = 0; i < pattern.blinks; i++) {
                await clock.tickAsync(1);
                // 1 ms
                await expectLedTurnedOn();
                await clock.tickAsync(pattern.onDuration - 2);
                // 499 ms
                await expectLedTurnedOn();
                await clock.tickAsync(1);
                // 500 ms
                await expectLedTurnedOff();
                await clock.tickAsync(pattern.offDuration - 1);
                // 799 ms
                await expectLedTurnedOff();
                await clock.tickAsync(1);
                // 800 ms
            }
        }
        blink.pattern.start(pattern);
        await expectPattern();
        // Should pause between blink sequences
        await clock.tickAsync(pattern.pause);
        await expectPattern();
        blink.pattern.stop();
    });
});