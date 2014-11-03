Additive Animation
==================

This is a simple **npm** module which implements additive animation algorithm described here:

http://iosoteric.com/additive-animations-animatewithduration-in-ios-8/

or in this video:

https://developer.apple.com/videos/wwdc/2014/#236

It combines concurrent animations of the same object into one smooth continuous animation.

Demo
----

[**Here it is**](http://alexkuz.github.io/additive-animation/) (I hope you like cats).

Usage Example
-------------

Let's make smooth scrolling for window. Create animation object and provide the options. You need to provide at least **onRender** callback:

```
var AdditiveAnimation = require('additive-animation');

function onRender(state) {
  window.scrollTo(0, state.y);
};

var animation = new AdditiveAnimation({
  onRender: onRender
});
```

Now call **animate** method to start animation:

```
var fromState = { y: 0 };
var toState = { y: 1000 };
var duration = 1000;

animation.animate(fromState, toState, duration);
```

To add new animation with another final state, just call it again:

```
fromState = { y: window.scrollTop };
toState = { y: 2000 };

animation.animate(fromState, toState, duration);
```

API
---

#### animation = new AdditiveAnimation(options)

Creates animation object. Possible options:


Name | Signature | Description
:---------|:--------|:--------
**onRender** | `function(state)` | (**required**) a callback for rendering current animation state.
**onFinish** | `function(finalState)` | Fires after the last animation is completed.
**onCancel** | `function()` | Fires if animation is canceled.
**enabledRAF** | `bool` | Use `window.requestAnimationFrame` in animation loop. **True** by default. **Note**: if you use it, you should probably also use some polyfill, like this: https://github.com/cagosta/requestAnimationFrame
**fps** | `number` | If RAF is disabled, `setTimeout` is used in animation loop. Here you can define frequency (**60** frames per second by default).

#### animation.animate(fromState, toState, duration)

Animates object state. `fromState` and `toState` are expected to be the objects with number values, e.g. `{ x: 100, y: 200 }`. `duration` is animation duration in milliseconds.

#### animation.isAnimating()

Returns `true` if there is an active animation.

#### animation.cancel()

Cancels current animation.
