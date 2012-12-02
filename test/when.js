var expect = require('expect.js')
  , when = require('../lib/when.js')()
  , Flow = require('../lib/flow.js')
  , Dummy = require('./dummy.js');

describe('#when', function() {

  it("should allow to destroy a flow", function(done) {
    var dummy = new Dummy()
      , timesOnCalled = 0
      , timesRunCalled = 0;

    var flow = when(dummy, 'test')
      .run(function(error, next, data){
        timesRunCalled++;
        flow.destroy();
      });

    dummy.on('test', function(){
      timesOnCalled++;

      if (timesOnCalled < 2) {
        dummy.doEmit('test');

        setTimeout(function(){
          expect(timesOnCalled).to.be.equal(2);
          expect(timesRunCalled).to.be.equal(1);
          done();
        }, 200);
      }
    });

    dummy.doEmit('test');
  });

  it("should run a SERIAL Flow on emitter by a given event name", function(done) {
    var dummy = new Dummy();

    var flow = when(dummy, 'test')
      .run(function(error, next, data){
        data.hello = 'hello';
        next();
      })
      .then(function(error, next, data){
        data.world = 'world';
        next();
      })
      .then(function(error, next, data){
        expect(data.hey).to.be.equal('hey');
        expect(data.hello).to.be.equal('hello');
        expect(data.world).to.be.equal('world');
        
        flow.destroy();
        done();
      });

    dummy.doEmit('test', {
      hey: 'hey'
    });

  });

  it("should run a PARALLEL Flow and call done when finish on emitter by a given event name", function(done) {
    var dummy = new Dummy();

    var flow = when(dummy, 'test')
      .run(function(error, next, data){
        expect(data.hey).to.be.equal('hey');
        data.hello1 = 'hello1';
        next();
      })
        .then(function(error, next, data){
          expect(data.hey).to.be.equal('hey');
          expect(data.hello1).to.be.equal('hello1');
          data.run1 = 'run1';
          next();
        })
      .run(function(error, next, data){
        expect(data.hey).to.be.equal('hey');
        data.hello2 = 'hello2';
        next();
      })
        .then(function(error, next, data){
          expect(data.hey).to.be.equal('hey');
          expect(data.hello2).to.be.equal('hello2');
          data.run2 = 'run2';
          next();
        })
      .on('done', function(data){
        expect(data.hey).to.be.equal('hey');

        expect(data.hello1).to.be.equal('hello1');
        expect(data.run1).to.be.equal('run1');

        expect(data.hello2).to.be.equal('hello2');
        expect(data.run2).to.be.equal('run2');

        flow.destroy();
        done();
      });

    dummy.doEmit('test', {
      hey: 'hey'
    });

  });

  it("should call on.error and stop execution when 'error' function is called", function(done) {
    var dummy = new Dummy()
      , errMsg = 'Some error!'
      , wasCalled = false;

    var flow = when(dummy, 'test')
      .run(function(error, next, data){
        next();
      })
      .then(function(error, next, data){
        error(new Error(errMsg));
        next();
      })
      .then(function(error, next, data){
        wasCalled = true;
      })
      .on('error', function(err){
        expect(wasCalled).to.be.equal(false);
        expect(err.message).to.be.equal(errMsg);
        done();
      });

    dummy.doEmit('test');
  });

});
