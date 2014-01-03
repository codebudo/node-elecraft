/*jslint node: true */
"use strict";

var SerialPort   = require('serialport');
var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var log       = require('./logger.js');
log.set(log.DEBUG);

// configs
var serialPortName = "/dev/cu.usbserial-A501XQ4S";

log.info("Starting...");

function Elecraft(){
  var self = this;
  EventEmitter.call(this);


  this.list = function(){
    log.debug("Listing available ports");
    SerialPort.list(function(err,ports){
      ports.forEach(function(port){
        //log.debug(port);
        log.debug(port.comName + ", " +port.pnpId+", "+port.manufacturer);
      });
    });
  }

  function validatePort(portName){
    SerialPort.list(function(err,ports){
      for( port in ports ){
        if( port.comName == portName ){
          console.log( port.comName );
          return true;
        }
      };
      return false;
    });
  }

  this.connect = function(){
    log.debug("Connecting...");
    var SP = SerialPort.SerialPort;

    // TODO fix async validation. Bypass for now.
    /*if( validatePort(serialPortName) ){
      log.debug("Found port " + serialPortName);
    } else {
      log.debug("Port not found. Exiting.");
      process.exit(); 
    }*/
    
    var kx3 = new SP(serialPortName, {
      baudrate: 4800,
    }, false);

    kx3.on('open', function(){
      var buffer = '';
      log.info('open');
      kx3.on('data', function(data){
        log.trace("data: "+data);
        //console.log( "data: "+data );
        if( data != undefined )
          buffer += data;
        var index = buffer.indexOf(';');
        while( index > 0 ){
          processCommand(buffer.substr(0,index));
          buffer = buffer.substring(index+1);
          index = buffer.indexOf(';');
        }

      });

      kx3.write('AI1;', function(err,results){
        if( err ){
          log.error("err "+err);
        }
        if( results ){
          log.info("resutls "+results);
        }
      });
    });

    kx3.open();
  }


  function processCommand(raw){
    log.debug('>'+raw);

    var three = commands[raw.substr(0,3)];
    var two   = commands[raw.substr(0,2)];
    var one   = commands[raw.substr(0,1)];


    // TODO build n-tree for this. It will be faster and not fugly.
    if(three != undefined ){
      log.trace(three);
      three.code = raw.substr(0,3);
      self.emit(three.name, new KEvent(three, raw));
    } else 
    if(two !== undefined ){
      log.trace(two);
      two.code = raw.substr(0,2);
      self.emit(two.name, new KEvent(two, raw));
    } else 
    if(one !== undefined ){
      log.trace(one);
      one.code = raw.substr(0,1);
      self.emit(one.name, new KEvent(one, raw));
    }
  }

  function KEvent(command, raw){
    var self = this;
    this.raw = raw;
    this.name = command.name;
    this.code = command.code;
    this.data = raw.substring(command.code);
    this.description = command.description;
    if( command.parser !== undefined ){
      command.parser(this);
    }
  }

  var commands = {
    "?":   {name:"busy",
            description: "busy"},
    "AG":  {name:"AFGainVFOA",
            parser: function(e){e.AFGainVFOA=parseInt(e.data)},
            description: "AF gain VFO-A"},
    "AG$": {name:"AFGainVFOB",
            parser: function(e){e.AFGainVFOB=parseInt(e.data)},
            description: "AF gain VFO-B"},
    "AI":  {name:"AutoInfoModeOn",
            parser: function(data){
              if( data == 0 )
                return false
              if( data == 1 )
                return true;
              return data;
            },
            description: "Auto-Info mode"},
    "AK":   "Internal Use Only",
    "AN":   "Antenna Selection",
    "BC":   "Interal Use Only",
    "BG":   "Bargraph read",
    "BN":   "Band Number VFO-A",
    "BN$":  "Band Number VFO-B",
    "BR":   "Baud rate set",
    "BW":   "Filter Bandwidth VFO-A",
    "BW$":  "Filter Bandwidth VFO-B",
    "CP":   "Speech compression",
    "CW":   "CW sidetone pitch",
    "DB":   "VFO-B text",
    "DL":   "DSP command trace",
    "DM":   "Internal Use Only",
    "DN":   "Frequency Down VFO-A",
    "DNB":  "Frequency Down VFO-B",
    "DS":   "VGO-A text/icons", // TODO build/return state object
    "DT":   "Data sub-mode",
    "DV":   "Diversity mode", 
    "EL":   "Error logging on/off", 
    "ES":   "ESSB mode", 
    "EW":   "Internal Use Only", 
    "FA":   "VFO-A Frequency", 
    "FB":   "VFO-B Frequency", 
    "FI":   "I.F. center frequency", 
    "FN":   "Interal Use Only", 
    "FR":   "Receive VFO select", 
    "FT":   "Transmit VFO select", 
    "FW":   "Filter bandwidth and # VFO-A", // deprecated. Use BW.
    "FW$":  "Filter bandwidth and # VFO-B", // deprecated. Use BW.
    "GT":   "AGC speed on/off", 
    "IC":   "Icon and misc. status", 
    "ID":   "Radio identification", 
    "IF":  {name:"GeneralInformation",
            parser: function(e){
              log.debug( "code "+ e.description );
              e.frequencyVFOA=14.268000;
              e.frequencyVFOB=14.268500;
            },
            description: "General information"}, 
    "IO":   "Internal Use Only", 
    "IS":   "IF shift", 
    "K2":   "K2 command mode", 
    "K3":   "K3 command mode", 
    "KS":   "Keyer speed", 
    "KT":   "Internal Use Only", 
    "KY":   "Keyboard CW/DATA", 
    "LD":   "Internal Use Only", 
    "LK":   "VFO-A Lock", 
    "LK$":  "VFO-B Lock", 
    "LN":   "Link VFOs", 
    "MC":   "Memory channel", 
    "MD":   "Operating Mode VFO-A", 
    "MD$":  "Operating Mode VFO-B", 
    "MG":   "Mic gain", 
    "ML":   "Monitor level", 
    "MN":   "Menu entry number", 
    "MP":   "Menu param read/set", 
    "MQ":   "Menu param read/set", // KX3 only
    "NB":   "Noise Blanketer VFO-A", 
    "NB$":  "Noise Blanketer VFO-B", 
    "NL":   "Noise blanketer level VFO-A", 
    "NL$":  "Noise blanketer level VFO-B", 
    "OM":   "Option Modules", 
    "PA":   "RX preamp on/off VFO-A", 
    "PA$":  "RX preamp on/off VFO-B", 
    "PC":   "Power Control", 
    "PN":   "Internal Use Only", 
    "PO":   "Power Output Read", 
    "PS":   "Power on/off", 
    "RA":   "RX attenuator on/off VFO-A", 
    "RA$":  "RX attenuator on/off VFO-B", 
    "RC":   "RIT/XIT offset clear", 
    "RD":   "RIT down", 
    "RG":   "RF gain VFO-A", 
    "RG$":  "RF gain VFO-B", 
    "RO":   "RIT/XIT offset (abs)", 
    "RT":   "RIT on/off", 
    "RU":   "RIT up", 
    "RV":   "Firmware revisions", 
    "RX":   "Enter RX mode", 
    "SB":   "Sub or dual watch", 
    "SD":   "QSK delay", 
    "SM":   "S-meter VFO-A", 
    "SM$":  "S-meter VFO-B", 
    "SMH":  "High-res S-Meter",  // Not for KX3
    "SP":   "Internal Use Only", 
    "SQ":   "Squelch Level VFO-A", 
    "SQ$":  "Squelch Level VFO-B", 
    "SWH":  "Hold functions",  // TODO model function object of Table 8
    "SWT":  "Tap functions", 
    "TB":   "Buffered text", 
    "TE":   "Transmit EQ", 
    "TQ":   "Transmit query",
    "TT":   "Text-to-Terminal", 
    "TX":   "Enter TX mode", 
    "UP":   "Frequency up VFO-A", 
    "UPB":  "Frequency up VFO-B", 
    "VX":   "VOX state", 
    "XF":   "XFIL number VFO-A", 
    "XF$":  "XFIL number VFO-B", 
    "XT":   "XIT on/off" 
  }

  //log.debug(exports);
  //return exports;
}

util.inherits(Elecraft, EventEmitter);
//log.debug(foo.prototype);
//log.debug(foo.super_);
//log.debug(foo instanceof EventEmitter);


module.exports = new Elecraft();

// TODO move tests to another file
var foo = new Elecraft();
foo.list();
foo.connect();
foo.on('GeneralInformation', function(e){
  log.debug( "got event '"+e.description+"'" );
  log.debug( e );
});


