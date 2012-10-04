## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/jkroso/Dom411/master/dist/Dom411.min.js
[max]: https://raw.github.com/jkroso/Dom411/master/src/Dom411.js

Then just combine with your favourite DOM library. While getting started, treat it just like the native event API, except with shorter names :).

##About
Dom411 is pronounced domal; as if the numbers were letters.
The benefit of domal is that it allows you break apart an event into several levels of specificity. This can make events more descriptive. For example "click.right" describes a right click and "move.right" describes a the mouse moving to the right. This reduces the need for conditionals in your handlers, thereby, allowing you to write simpler code. Further, though when the "move.right" event fires it doesn't just trigger the handlers bound to that exact event. It also fires the "move" event and the global channel event (always fired). This allows you to break apart your solution more readily. For example you might bind a function to "move.right" which breifly renders a right pointing arrow on the screen while positioning this arrow with a function bound on the "move" event and reseting the last user activity timer in a function bound to the global channel. 

##Example
```javascript
$("div")
	.on('down.left', function (e) {
        console.log(e.name)
    })
    .trigger('down.left', 'some random data')
    .off('down.left')
// Will output "down.left" to the console
```
Downlaod the [Mouse][mouse] repo and run the demo in order to see it in action

[mouse]: https://raw.github.com/jkroso/Mouse/

## API

* .on([topics, fn, [priority])__: add callback as listener for each type in types
* .off([topics], [fn])__: remove callback from listeners for each type in types
* .once([topics, fn, [priority])__: add callback as listener for the first time each type in types fires, then removes it
* .delegate(selector, topics, fn, bubbles)

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

_Also, please don't edit files in the "dist" subdirectory as they are generated via grunt. You'll find source code in the "src" subdirectory!_

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Jakeb Rosoman  
Licensed under the MIT license.
