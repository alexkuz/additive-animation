var Animation = require('../index'),
    expect = require('chai').expect;

describe('#animate', function() {
  before(function () {
    global.window = require('global/window');
  });

  after(function () {
    delete global.window;
  });

  it('returns final state on finish', function(done) {
    var animation = new Animation({
      onFinish: function (finalState) {
        expect(finalState).to.deep.equal({ x: 100, y: 200 });
        done();
      }
    });

    animation.animate({ x: 0, y: 0 }, { x: 100, y: 200 }, 200);
  });

  it('cancels animation', function(done) {
    var animation = new Animation({
      onRender: function (currentState) {
        expect(currentState).not.to.deep.equal({ x: 100, y: 200 });
      },
      onCancel: function () {
        done();
      }
    });

    animation.animate({ x: 0, y: 0 }, { x: 100, y: 200 }, 400);

    setTimeout(function () {
      animation.cancel();
    }, 200);
  });

  it('returns last animation final state on finish', function(done) {
    var animation = new Animation({
      onFinish: function (finalState) {
        expect(finalState).to.deep.equal({ x: 300, y: 400 });
        done();
      }
    });

    animation.animate({ x: 0, y: 0 }, { x: 100, y: 200 }, 400);
    setTimeout(function () {
      animation.animate({ x: 100, y: 200 }, { x: 300, y: 400 }, 400);
    }, 200);
  });
});