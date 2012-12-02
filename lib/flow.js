
var events = require('events')
  , _ = require('underscore')
  , logger;

function Flow(opts) {
  logger = require('./logger').logger();

  this.runs = [];
  this.done;

  this.emitter = opts.emitter;
  this.eventName = opts.eventName;

  this.doneCalls = 0;
  this.allData = {};

  var self = this;
  this.emitter.on(this.eventName, function(data){
    self.start(data);
  });
};

module.exports = Flow;
Flow.prototype = new events.EventEmitter;

Flow.prototype.start = function(data) {
  for(var i = 0; i < this.runs.length; i++) {
    exec.call(this, i, data);
  }
};

Flow.prototype.run = function(func) {
  this.runs.push([]);
  return this.then(func);
};

Flow.prototype.then = function(func) {
  this.runs[this.runs.length-1].push(func);
  return this;
};

Flow.prototype.done = function(func) {
  this.done = func;
  return this;
};

Flow.prototype.destroy = function() {
  var i, j;

  this.emitter.removeListener(this.eventName, this.start);
  this.emitter = null;

  while(i = this.runs.length) {
    var r = this.runs[i-1];
    while(j = r.length) {
      r.splice(j-1, 1);
    }
    this.runs.splice(i-1, 1);
  }
};

function exec(runIdx, d){
  (function(ctx, rIdx, cbLen, data){
    var idx = 0;

    function doRun() {
      logger.debug('Run %s | Then %s of %s', rIdx, idx, cbLen);

      ctx.runs[rIdx][idx](
        function(err) {
          ctx.emit('error', err);
        } 
        , function() {
          if (idx < cbLen) {
            idx++;
            doRun();
          }
          else runDone.call(ctx, data);
        }
        , data
      );
    }

    doRun();

  })(this, runIdx, this.runs[runIdx].length-1, d);
}

function runDone(data){
  this.doneCalls++;
  _.extend(this.allData, data);
  if (this.doneCalls === this.runs.length){
    this.emit('done', this.allData);
  }
}
