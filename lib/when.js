
var Flow = require('./flow')
  , logger = require('./logger');

module.exports = function(config){
  var cfg = {
    log: (config && config.log) || 'error'
  };

  logger.config(cfg.log);

  return function(emitter, eventName){
    return new Flow({
      emitter: emitter, 
      eventName: eventName
    });
  };
};
