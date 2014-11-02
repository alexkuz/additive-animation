'use strict';

var raf = require('raf'),
    EasingFunctions = require('./EasingFunctions'),
    isNode = typeof global !== "undefined" && {}.toString.call(global) == '[object global]',
    noop = function() {};

/**
 * 
 *
 */

function now() {
  if (!isNode && window.performance && window.performance.now) {
    return window.performance.now();
  }

  if (Date.now) {
    return Date.now();
  }

  return new Date().getTime();
}

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

  if (isNode) {
    enabledRAF = false;
  }

  stepFunc = enabledRAF ? raf : function(func) { setTimeout(func, 1000 / fps); };

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
      if (enabledRAF) {
        raf.cancel(frame);
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