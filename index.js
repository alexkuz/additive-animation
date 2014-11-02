'use strict';

var EasingFunctions = require('./EasingFunctions'),
    noop = function() {};

/**
 * Animates object state, combining concurrent animations. It uses "Additive animation" algorithm, described here:
 *
 * https://developer.apple.com/videos/wwdc/2014/#236
 *
 * Sample code:
 *
 *   function onRender(state) {
 *     window.scrollTo(0, state.y);
 *   }
 *
 *   var animation = Animation({ onRender: onRender });
 *
 *   animation.animate({ y: 0 }, { y: 1000 }, 'easeInOutQuad');
 *
 *   ...
 *
 *   animation.animate({ y: 1000 }, { y: 2000 }, 'linear');
 */

var Animation = function (options) {
  var frame = null,
      lastTargetState = null,
      currentState = null,
      animationStack = [],
      onRender = options.onRender || noop,
      onFinish = options.onFinish || noop,
      onCancel = options.onCancel || noop,
      enabledRAF = options.enabledRAF || options.enabledRAF === undefined,
      fps = options.fps || 60,
      stepFunc;

  stepFunc = enabledRAF && window.requestAnimationFrame || function(func) { setTimeout(func, 1000 / fps); };

  function now() {
    if (window.performance && window.performance.now) {
      return window.performance.now();
    }

    if (Date.now) {
      return Date.now();
    }

    return new Date().getTime();
  }

  function isAnimating() {
    return !!lastTargetState;
  }

  function finish() {
    if (lastTargetState !== null) {
      onFinish(lastTargetState);

      lastTargetState = null;
      currentState = null;
    }
  }

  function cancel() {
    if (lastTargetState !== null) {
      if (enabledRAF && window.cancelAnimationFrame) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
      onCancel();

      lastTargetState = null;
      currentState = null;
    }
  }

  function filterOutdatedTargetsFromStack(time) {
    var filteredStack = [];
    for (var i = animationStack.length - 1; i >= 0; i--) {
      if (animationStack[i].end > time) {
        filteredStack.push(animationStack[i]);
      }
    }

    animationStack = filteredStack;
  }

  function getCurrentState(time) {
    var target = {},
        animation,
        remain,
        key;

    for (key in lastTargetState) {
      target[key] = lastTargetState[key];
    }

    for (var i = animationStack.length - 1; i >= 0; i--) {
      animation = animationStack[i];
      if (animation.end < time) { continue; }
      remain = (animation.end - time) / animation.duration;
      for (key in target) {
        target[key] -= (animation.toState[key] - animation.fromState[key]) * animation.easing(remain);
      }
    }

    return target;
  }

  function hasActiveAnimation(time) {
    for (var i = animationStack.length - 1; i >= 0; i--) {
      var animation = animationStack[i];
      if (animation.end >= time) { return true; }
    }    
  }

  function animationStep() {
    if (lastTargetState === null) { return; }

    var time = now();
    
    currentState = getCurrentState(time);

    onRender(currentState);

    if (hasActiveAnimation(time)) {
      frame = stepFunc(animationStep);
    } else {
      finish();
    }
  }

  function animate(fromState, toState, duration, easing) {
    var time = now(),
        animation;

    animation = {
      duration: duration,
      end: time + duration,
      fromState: lastTargetState === null ? fromState : lastTargetState,
      toState: toState,
      easing: ((typeof easing === 'string') ? EasingFunctions[easing] : easing) || EasingFunctions.easeInOutQuad
    };

    filterOutdatedTargetsFromStack(time);

    animationStack.push(animation);

    lastTargetState = toState;

    frame = stepFunc(animationStep);
  }

  return {
    animate: animate,
    isAnimating: isAnimating,
    cancel: cancel
  };
};


module.exports = Animation;