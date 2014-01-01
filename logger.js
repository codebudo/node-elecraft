
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
    logger(this.TRACE, message)
  },
  debug: function(message){
    logger(this.DEBUG, message)
  },
  info: function(message){
    logger(this.INFO, message)
  },
  warn: function(message){
    logger(this.WARN, message)
  },
  error: function(message){
    logger(this.ERROR, message)
  },
  severe: function(message){
    logger(this.severe, message)
  },
  log: logger
}

currentLevel = exports.DEBUG; // default to DEBUG
module.exports = exports;
