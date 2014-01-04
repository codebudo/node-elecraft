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
        log.info(port.comName + ", " +port.pnpId+", "+port.manufacturer);
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

  this.connect = function(port){
    if( !!port )
      serialPortName = port;

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
      kx3.write('DS;')
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
    "?":    {name:"busy",
             description: "busy"},
    "AG":   {name:"AFGainVFOA",
             parser: function(e){e.AFGainVFOA=parseInt(e.data)},
             description: "AF gain VFO-A"},
    "AG$":  {name:"AFGainVFOB",
             parser: function(e){e.AFGainVFOB=parseInt(e.data)},
             description: "AF gain VFO-B"},
    "AI":   {name:"AutoInfoMode",
             description: "Auto-Info mode",
             parser: function(e){
               e.autoInfoMode = parseInt(e.data);
            }},
    "AK":   {description:"Internal Use Only"},
    "AN":   {name:"antennaSelection",
             description:"Antenna Selection",
             parser: function(e){
               e.antenna = parseInt(e.data);
            }},
    "BC":   {description:"Interal Use Only"},
    "BG":   {name:"bargraph",
             description:"Bargraph read",
             parser: function(e){
               e.bargraph = parseInt(e.data.substr(0,2));
               e.transmit = (e.data.substr(2,1)=='T')?true:false;
               e.receive  = (e.data.substr(2,1)=='R')?true:false;
            }},
    "BN":   {name:"bandChangeVFOA",
             description:"Band Number VFO-A",
             parser: bandChangeUpDown
            },
    "BN$":  {name:"bandChangeVFOB",
             description:"Band Number VFO-B",
             parser: bandChangeUpDown
            },
    "BR":   {name:"baudRate",
             description:"Baud rate set",
             parser: function(e){
               switch(parseInt(e.data)){
                 case 0:
                   e.baudRate = 4800;
                   break;
                 case 2:
                   e.baudRate = 9600;
                   break;
                 case 3:
                   e.baudRate = 38400;
                   break;
               }
            }},
    "BW":   {name:"filterBandwidthVFOA",
             description:"Filter Bandwidth VFO-A",
             parser: function(e){
               e.filterBandwidth = parseInt(e.data);
            }},
    "BW$":  {name:"filterBandwidthVFOB",
             description:"Filter Bandwidth VFO-B",
             parser: function(e){
               e.filterBandwidth = parseInt(e.data);
            }},
    "CP":   {name:"speechCompression",
             description:"Speech compression",
             parser: function(e){
               e.speechCompression = parseInt(e.data);
            }},
    "CW":   {name:"sidetonePitch",
             description:"CW sidetone pitch",
             parser: function(e){
               e.sidetonePitch = parseInt(e.data);
            }},
    "DB":   {name:"displayVFOB",
             description:"VFO-B display text",
             parser: function(e){
               e.display = e.data;
            }},
    "DL":   {name:"dspCommandTrace",
             description:"DSP command trace",
             parser: function(e){
               if( e.data == '2')
                 e.dspDebug = false
               if( e.data == '3')
                 e.dspDebug = true;
            }},
    "DM":   {description:"Internal Use Only"},
    "DN":   {name:"downVFOA",
             description:"Frequency Down VFO-A",
             parser: vfoUpDown
            },
    "DNB":  {name:"downVFOB", 
             description:"Frequency Down VFO-B",
             parser: vfoUpDown
            },
    "DS":   {name:"displayVFOA",
             description:"VFO-A text/icons", 
             parser: function(e){
               // TODO this doesn't work. Characters after a '.' are always '='
               // This could be a problem with the API and docs or a bug in
               // node-serialport. Much researchings...
               var zeros = '0000000000000000';
               e.display = e.data.substr(0,8);
               var output = [];

               var allBinary='';
               for( var i in e.data ){
                 var binaryValue = e.data.charCodeAt(i).toString(2);

                 // pad zeros in front so we always have a 16bit string
                 binaryValue = zeros.substr(binaryValue.length)+binaryValue;
                 allBinary += binaryValue +' ';
                 if( binaryValue[7] == '1' ){
                   output.push( '.' );
                 }
                 var charCode = parseInt(binaryValue.substr(-6),2);
                 var thisChar = String.fromCharCode(charCode);
                 output.push( thisChar );

                 //log.debug( thisChar+' '+binaryValue+' '+charCode );
               }
               //log.debug( output.join('') );
               //log.debug( allBinary );
                              
            }},
    "DT":   {name:"dataMode",
             description:"Data sub-mode",
             parser: function(e){
               switch(parseInt(e.data)){
                 case 0:
                   e.dataMode = 'DATA A';
                   break;
                 case 1:
                   e.dataMode = 'AFSK A';
                   break;
                 case 2:
                   e.dataMode = 'FSK D';
                   break;
                 case 3:
                   e.dataMode = 'PSK D';
                   break;
               }
            }},
    "DV":   {name:"diversityModeOn",
             description:"Diversity mode", 
             parser: function(e){
               e.diversityModeOn = (e.data=='1')?true:false;
            }},
    "EL":   {name:"errorLoggingOn",
             description:"Error logging on/off", 
             parser: function(e){
               e.errorLoggingOn = (e.data=='1')?true:false;
            }},
    "ES":   {name:"essbModeOn",
             description:"ESSB mode", 
             parser: function(e){
               e.essbModeOn = (e.data=='1')?true:false;
            }},
    "EW":   {description:"Internal Use Only"}, 
    "FA":   {name:"frequencyVFOA",
             description:"VFO-A Frequency", 
             parser: function(e){
               e.frequencyVFOA = parseInt(e.data);
            }},
    "FB":   {name:"frequencyVFOB",
             description:"VFO-B Frequency", 
             parser: function(e){
               e.frequencyVFOB = parseInt(e.data);
            }},
    "FI":   {name:"IFCenterFrequency",
             description:"I.F. center frequency", 
             parser: function(e){
               e.centerFrequency = parseInt(e.data);
            }},
    "FN":   {description:"Interal Use Only"}, 
    "FR":   {name:"receiveVFO",
             description:"Receive VFO select"}, 
             parser: function(e){
               e.receiveVFO = e.data;
            }},
    "FT":   {name:"transmitVFO",
             description:"Transmit VFO select"}, 
             parser: function(e){
               e.transmitVFO = e.data;
            }},
    "FW":   {name:"filterBandwidthVFOA",
             description:"Filter bandwidth and # VFO-A (Deprecated. Use BW)",
             parser: function(e){
               log.warn("FW is deprecated. Use BW.");
               e.filterBandwidth = parseInt(e.data);
            }},
    "FW$":  {name:"filterBandwidthVFOB",
             description:"Filter bandwidth and # VFO-B (Deprecated. Use BW)",
             parser: function(e){
               log.warn("FW$ is deprecated. Use BW.");
               e.filterBandwidth = parseInt(e.data);
            }},
    "GT":   {description:"AGC speed on/off"}, 
    "IC":   {description:"Icon and misc. status"}, 
    "ID":   {description:"Radio identification"}, 
    "IF":   {name:"GeneralInformation",
             description: "General information", 
             parser: function(e){
               e.frequencyVFOA=14.268000;
               e.frequencyVFOB=14.268500;
            }},
    "IO":   {description:"Internal Use Only"}, 
    "IS":   {description:"IF shift"}, 
    "K2":   {description:"K2 command mode"}, 
    "K3":   {description:"K3 command mode"}, 
    "KS":   {description:"Keyer speed"}, 
    "KT":   {description:"Internal Use Only"}, 
    "KY":   {description:"Keyboard CW/DATA"}, 
    "LD":   {description:"Internal Use Only"}, 
    "LK":   {description:"VFO-A Lock"}, 
    "LK$":  {description:"VFO-B Lock"}, 
    "LN":   {description:"Link VFOs"}, 
    "MC":   {description:"Memory channel"}, 
    "MD":   {description:"Operating Mode VFO-A"}, 
    "MD$":  {description:"Operating Mode VFO-B"}, 
    "MG":   {description:"Mic gain"}, 
    "ML":   {description:"Monitor level"}, 
    "MN":   {description:"Menu entry number"}, 
    "MP":   {description:"Menu param read/set"}, 
    "MQ":   {description:"Menu param read/set"}, // KX3 only
    "NB":   {description:"Noise Blanketer VFO-A"}, 
    "NB$":  {description:"Noise Blanketer VFO-B"}, 
    "NL":   {description:"Noise blanketer level VFO-A"}, 
    "NL$":  {description:"Noise blanketer level VFO-B"}, 
    "OM":   {description:"Option Modules"}, 
    "PA":   {description:"RX preamp on/off VFO-A"}, 
    "PA$":  {description:"RX preamp on/off VFO-B"}, 
    "PC":   {description:"Power Control"}, 
    "PN":   {description:"Internal Use Only"}, 
    "PO":   {description:"Power Output Read"}, 
    "PS":   {description:"Power on/off"}, 
    "RA":   {description:"RX attenuator on/off VFO-A"}, 
    "RA$":  {description:"RX attenuator on/off VFO-B"}, 
    "RC":   {description:"RIT/XIT offset clear"}, 
    "RD":   {description:"RIT down"}, 
    "RG":   {description:"RF gain VFO-A"}, 
    "RG$":  {description:"RF gain VFO-B"}, 
    "RO":   {description:"RIT/XIT offset (abs)"}, 
    "RT":   {description:"RIT on/off"}, 
    "RU":   {description:"RIT up"}, 
    "RV":   {description:"Firmware revisions"}, 
    "RX":   {description:"Enter RX mode"}, 
    "SB":   {description:"Sub or dual watch"}, 
    "SD":   {description:"QSK delay"}, 
    "SM":   {description:"S-meter VFO-A"}, 
    "SM$":  {description:"S-meter VFO-B"}, 
    "SMH":  {description:"High-res S-Meter"},  // Not for KX3
    "SP":   {description:"Internal Use Only"}, 
    "SQ":   {description:"Squelch Level VFO-A"}, 
    "SQ$":  {description:"Squelch Level VFO-B"}, 
    "SWH":  {description:"Hold functions"},  // TODO model function object of Table 8
    "SWT":  {description:"Tap functions"}, 
    "TB":   {description:"Buffered text"}, 
    "TE":   {description:"Transmit EQ"}, 
    "TQ":   {description:"Transmit query"},
    "TT":   {description:"Text-to-Terminal"}, 
    "TX":   {description:"Enter TX mode"}, 
    "UP":   {description:"Frequency up VFO-A"}, 
    "UPB":  {description:"Frequency up VFO-B"}, 
    "VX":   {description:"VOX state"}, 
    "XF":   {description:"XFIL number VFO-A"}, 
    "XF$":  {description:"XFIL number VFO-B"}, 
    "XT":   {description:"XIT on/off"}
  }

  function bandChangeUpDown(e){
    switch(parseInt(e.data)){
      case 0:
        e.band = 160;
        break;
      case 2:
        e.band = 80;
        break;
      case 3:
        e.band = 40;
        break;
      case 4:
        e.band = 30;
        break;
      case 5:
        e.band = 20;
        break;
      case 6:
        e.band = 17;
        break;
      case 7:
        e.band = 15;
        break;
      case 8:
        e.band = 12;
        break;
      case 9:
        e.band = 10;
        break;
      case 10:
        e.band = 6;
        break;
      default:
        if( e.band >= 11 && e.band <= 15 ){
          // reserved for expansion
          e.band = null;
        }
        if( e.band >= 16 && e.band <= 24 ){
          e.band = "Xvtr band #"+e.band-15; // ?? Not sure
        }
    } // end switch
  }

  function vfoUpDown(e){
    // e.delta is in Hz
    switch(parseInt(e.data)){
      case 0:
        e.delta = 1;
        break;
      case 1:
        e.delta = 10;
        break;
      case 2:
        e.delta = 20;
        break;
      case 3:
        e.delta = 50;
        break;
      case 4:
        e.delta = 1000;
        break;
      case 5:
        e.delta = 2000;
        break;
      case 6:
        e.delta = 3000;
        break;
      case 7:
        e.delta = 5000;
        break;
      case 8:
        e.delta = 100;
        break;
      case 9:
        e.delta = 200;
        break;
    }
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
  log.debug( e );
});


