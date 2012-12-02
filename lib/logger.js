var colors = require('colors');

var lvl = 'error';
module.exports = {
  config: function(level){
    lvl = level;
  },
  logger: function(){

    return require('tracer').colorConsole({
      level: lvl,
      filters: {
        log : colors.grey,
        trace : colors.magenta,
        debug : colors.cyan,
        info : colors.green,
        warn : colors.yellow,
        error : [ colors.red, colors.bold ]
      },
      format : [
        "[{{title}}] {{message}} - GoWithTheFlow", //default format
        //"{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})", //default format
        {
          error : "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})\nCall Stack:{{stacklist}}" // error format
        } 
      ],
      dateformat : "mm/dd/yyyy HH:MM:ss.L",
      preprocess :  function(data){
        if(data.title==='error'){
          var callstack = '',len=data.stack.length;
          for(var i=0; i<len; i+=1){
            callstack += '\n'+data.stack[i];
          }
          data.stacklist = callstack;
        }
        data.title = data.title.toUpperCase();
      }
    });

  }
};
