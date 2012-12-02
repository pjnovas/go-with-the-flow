

var events = require('events');

function Dummy() {

};

module.exports = Dummy;
Dummy.prototype = new events.EventEmitter;

Dummy.prototype.doEmit = function(name, data) {
  this.emit(name, data);
};
