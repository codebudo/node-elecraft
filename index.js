var logger = require('./logger.js');
logger.set(logger.DEBUG);
var log = logger.log;
var SerialPort = require('serialport');

log(logger.INFO, "Starting...");

// configs
serialPortName = "/dev/cu.usbserial-A501XQ4S";

SerialPort.list(function(err,ports){
  var portName;
  ports.forEach(function(port){
    //log(logger.DEBUG, port);
    //log(logger.DEBUG, port.comName + ", " +port.pnpId+", "+port.manufacturer);
    if( port.comName == serialPortName )
      portName = serialPortName;
  });
  if( !!portName ){
    log(logger.INFO, "found port " + portName);
  } else {
    log(logger.ERROR, "port not found.");
    // exit();
  }
});

var SP = SerialPort.SerialPort;
var kx3 = new SP(serialPortName, {
  baudrate: 4800,
}, false);

kx3.on('open', function(){
  var buffer;
  log(logger.INFO, 'open');
  kx3.on('data', function(data){

    log(logger.INFO, '>'+data);
  });

  kx3.write('FA;', function(err,results){
    if( err ){
      log(logger.ERROR, "err "+err);
    }
    if( results ){
      log(logger.INFO, "resutls "+results);
    }
  });
});

kx3.open();
