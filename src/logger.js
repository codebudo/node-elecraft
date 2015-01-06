
var winston = require('winston');

var logger = new winston.Logger({
  transports:[
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'info',
      handleExceptions: false,
      colorize: true
    })
  ],
  colors:{
    //info: 'blue'
  }
});

logger.trace = function(msg){
  logger.verbose(msg);
}

module.exports = logger;


