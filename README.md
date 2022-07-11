# Blinking

This is a module that allows specifying a file path and a pattern and will then write `'0'` or `'1'` according to the pattern. This is useful in particular for blinking the LED on Raspberry Pis as the LED can be controlled via a file, although it will act the same for any file path that is provided.

## Interface
A blink factory will be returned by calling the module with the path to your LED file:
```
import blinking = require('blinking');
const blink = blinking('/path/to/my/led/file');
```

A blink factory has 2 methods, `pattern.start` and `pattern.stop`. `start` may be passed some pattern options:
```
{
	blinks: number;
	onDuration: number;
	offDuration: number;
	pause: number;
}
```

- `blinks`: number of blinks per sequence
- `onDuration`: Number of milliseconds LED stays on
- `offDuration`: Number of milliseconds LED stays off
- `pause`: Number of milliseconds between blink sequences

## Example
```javascript
const blink = blinking('/path/to/my/led/file');
blink.pattern.start({
    blinks: 2,
    onDuration: 100,
    offDuration: 100,
    pause: 300
});
// ...
blink.pattern.stop();
```

The above snippet will, until stopped, execute the following repeatedly:

1. LED on, 100 ms
2. LED off, 100 ms
3. LED on, 100 ms
4. LED off, 100 ms
5. Pause, 300 ms
