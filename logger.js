
var currentLevel;

logger = function(level, message){
  if( level >= currentLevel )
    console.log( message );
}

var exports = {
  OFF:    0,
  TRACE:  1,
  DEBUG:  2,
  INFO:   3,
  WARN:   4,
  ERROR:  5,
  SEVERE: 6,

  set: function(level){
    currentLevel = level;
  },
  trace: function(message){
    log(logger.TRACE, message)
  },
  debug: function(message){
    log(logger.DEBUG, message)
  },
  info: function(message){
    log(logger.INFO, message)
  },
  warn: function(message){
    log(logger.WARN, message)
  },
  error: function(message){
    log(logger.ERROR, message)
  },
  severe: function(message){
    log(logger.severe, message)
  },
  log: logger
}

currentLevel = logger.DEBUG; // default to DEBUG
module.exports = exports;
