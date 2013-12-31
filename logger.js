
var currentLevel;

logger = function(level, message){
  if( level >= currentLevel )
    console.log( message );
}

var exports = {
  OFF:    0,
  DEBUG:  1,
  INFO:   2,
  WARN:   3,
  ERROR:  4,
  SEVERE: 5,

  set: function(level){
    currentLevel = level;
  },
  log: logger
}

currentLevel = logger.DEBUG; // default to DEBUG
module.exports = exports;
