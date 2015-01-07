/*jslint node: true */
"use strict";

var SerialPort   = require('serialport');
var util         = require('util');
var EventEmitter = require('eventemitter2').EventEmitter2;
var log          = require('./logger.js');
//log.set(log.DEBUG);

// configs
var serialPortName = "/dev/cu.usbserial-A501XQ4S";

log.verbose("Starting...");

function Elecraft(){
  var self = this;
  EventEmitter.call(this);


  this.list = function(cb){
    log.verbose("Get list of available ports");
    SerialPort.list(function(err,ports){
      ("function" == typeof cb)?cb(ports):"";
    });
  }

  function validatePort(portName, cb){
    self.list(function(ports){
      for( var port in ports ){
        if( ports[port].comName == portName ){
          cb();
          return;
        }
      };
      cb(portName + " is not a valid serial port");
    });
  }

  this.connect = function(port, cb){
    if( !!port )
      serialPortName = port;

    log.verbose("Connecting...");
    var SP = SerialPort.SerialPort;

    validatePort(serialPortName, function(err){
      if(err){
        log.debug(err);
        log.error("Port not found. Exiting.");
        process.exit(); 
      }
      log.verbose("Found port " + serialPortName);
    
      var kx3 = new SP(serialPortName, {
        baudrate: 4800,
      }, false);

      kx3.on('error', log.error);
      kx3.on('close', function(e){
        log.info('closed');
        log.verbose(e);
      });

      kx3.on('open', function(){
        var buffer = '';
        log.info('open');
        kx3.on('data', function(data){
          log.verbose("data: "+data);
          if( data != undefined )
            buffer += data;
          var index = buffer.indexOf(';');
          while( index > 0 ){
            self.processCommand(buffer.substr(0,index));
            buffer = buffer.substring(index+1);
            index = buffer.indexOf(';');
          }

        });

        // engage autoInfoMode
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
    });
  }


  this.processCommand = function(raw){
    log.verbose('>'+raw);

    var three = commands[raw.substr(0,3)];
    var two   = commands[raw.substr(0,2)];
    var one   = commands[raw.substr(0,1)];


    // TODO build n-tree for this. It will be faster and not fugly.
    if(three != undefined ){
      log.verbose(three);
      three.code = raw.substr(0,3);
      self.emit(three.name, new KEvent(three, raw));
    } else 
    if(two !== undefined ){
      log.verbose(two);
      two.code = raw.substr(0,2);
      self.emit(two.name, new KEvent(two, raw));
    } else 
    if(one !== undefined ){
      log.verbose(one);
      one.code = raw.substr(0,1);
      self.emit(one.name, new KEvent(one, raw));
    }
  }

  function KEvent(command, raw){
    var self = this;
    this.raw = raw;
    this.name = command.name;
    this.code = command.code;
    this.raw = raw.substring(command.code);
    this.data = {};
    this.description = command.description;
    if( command.parser !== undefined ){
      command.parser(this);
    }
  }

  //this.commands = {
  var commands = {
    "?":    {name:"busy",
             description: "busy"},
    "AG":   {name:"AFGainVFOA",
             description: "AF gain VFO-A",
             parser: function(e){
               e.data.AFGainVFOA = parseInt(e.raw.substr(2))
            }},
    "AG$":  {name:"AFGainVFOB",
             description: "AF gain VFO-B",
             parser: function(e){
               e.data.AFGainVFOB = parseInt(e.raw.substr(2));
            }},
    "AI":   {name:"AutoInfoMode",
             description: "Auto-Info mode",
             parser: function(e){
               e.data.autoInfoMode = parseInt(e.raw.substr(2));
            }},
    "AK":   {description:"Internal Use Only"},
    "AN":   {name:"antennaSelection",
             description:"Antenna Selection",
             parser: function(e){
               e.data.antenna = parseInt(e.raw);
            }},
    "BC":   {description:"Interal Use Only"},
    "BG":   {name:"bargraph",
             description:"Bargraph read",
             parser: function(e){
               e.data.bargraph = parseInt(e.raw.substr(0,2));
               e.data.transmit = (e.raw.substr(2,1)=='T')?true:false;
               e.data.receive  = (e.raw.substr(2,1)=='R')?true:false;
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
               switch(parseInt(e.raw.substr(2))){
                 case 0:
                   e.data.baudRate = 4800;
                   break;
                 case 2:
                   e.data.baudRate = 9600;
                   break;
                 case 3:
                   e.data.baudRate = 38400;
                   break;
               }
            }},
    "BW":   {name:"filterBandwidthVFOA",
             description:"Filter Bandwidth VFO-A",
             parser: function(e){
               e.data.filterBandwidth = parseInt(e.raw);
            }},
    "BW$":  {name:"filterBandwidthVFOB",
             description:"Filter Bandwidth VFO-B",
             parser: function(e){
               e.data.filterBandwidth = parseInt(e.raw);
            }},
    "CP":   {name:"speechCompression",
             description:"Speech compression",
             parser: function(e){
               e.data.speechCompression = parseInt(e.raw);
            }},
    "CW":   {name:"sidetonePitch",
             description:"CW sidetone pitch",
             parser: function(e){
               e.data.sidetonePitch = parseInt(e.raw);
            }},
    "DB":   {name:"displayVFOB",
             description:"VFO-B display text",
             parser: function(e){
               e.data.display = e.raw;
            }},
    "DL":   {name:"dspCommandTrace",
             description:"DSP command trace",
             parser: function(e){
               if( e.raw.substr(2) === '2')
                 e.data.dspDebug = false;
               if( e.raw.substr(2) === '3')
                 e.data.dspDebug = true;
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
               e.data.display = e.raw.substr(2,8);
               var output = [];

               var allBinary='';
               for( var i in e.raw ){
                 var binaryValue = e.raw.charCodeAt(i).toString(2);

                 // pad zeros in front so we always have a 16bit string
                 binaryValue = zeros.substr(binaryValue.length)+binaryValue;
                 allBinary += binaryValue +' ';
                 if( binaryValue[7] == '1' ){
                   output.push( '.' );
                 }
                 var charCode = parseInt(binaryValue.substr(-6),2);
                 var thisChar = String.fromCharCode(charCode);
                 output.push( thisChar );

                 log.verbose( thisChar+' '+binaryValue+' '+charCode );
               }
               //log.verbose( output.join('') );
               //log.verbose( allBinary );
                              
            }},
    "DT":   {name:"dataMode",
             description:"Data sub-mode",
             parser: function(e){
               switch(parseInt(e.raw.substr(2))){
                 case 0:
                   e.data.dataMode = 'DATA A';
                   break;
                 case 1:
                   e.data.dataMode = 'AFSK A';
                   break;
                 case 2:
                   e.data.dataMode = 'FSK D';
                   break;
                 case 3:
                   e.data.dataMode = 'PSK D';
                   break;
               }
            }},
    "DV":   {name:"diversityModeOn",
             description:"Diversity mode", 
             parser: function(e){
               e.data.diversityModeOn = (e.raw=='1')?true:false;
            }},
    "EL":   {name:"errorLoggingOn",
             description:"Error logging on/off", 
             parser: function(e){
               e.data.errorLoggingOn = (e.raw=='1')?true:false;
            }},
    "ES":   {name:"essbModeOn",
             description:"ESSB mode", 
             parser: function(e){
               e.data.essbModeOn = (e.raw=='1')?true:false;
            }},
    "EW":   {description:"Internal Use Only"}, 
    "FA":   {name:"frequencyVFOA",
             description:"VFO-A Frequency", 
             parser: function(e){
               e.data.frequencyVFOA = parseInt(e.raw.substr(2));
            }},
    "FB":   {name:"frequencyVFOB",
             description:"VFO-B Frequency", 
             parser: function(e){
               e.data.frequencyVFOB = parseInt(e.raw.substr(3));
            }},
    "FI":   {name:"IFCenterFrequency",
             description:"I.F. center frequency", 
             parser: function(e){
               e.data.centerFrequency = parseInt(e.raw);
            }},
    "FN":   {description:"Interal Use Only"}, 
    "FR":   {name:"receiveVFO",
             description:"Receive VFO select", 
             parser: function(e){
               e.data.receiveVFO = e.raw;
            }},
    "FT":   {name:"transmitVFO",
             description:"Transmit VFO select", 
             parser: function(e){
               e.data.transmitVFO = e.raw;
            }},
    "FW":   {name:"filterBandwidthVFOA",
             description:"Filter bandwidth and # VFO-A (Deprecated. Use BW)",
             parser: function(e){
               log.warn("FW is deprecated. Use BW.");
               e.data.filterBandwidth = parseInt(e.raw);
            }},
    "FW$":  {name:"filterBandwidthVFOB",
             description:"Filter bandwidth and # VFO-B (Deprecated. Use BW)",
             parser: function(e){
               log.warn("FW$ is deprecated. Use BW.");
               e.data.filterBandwidth = parseInt(e.raw);
            }},
    "GT":   {name:"agcSpeed",
             description:"AGC speed on/off", 
             parser: function(e){
               e.data.agcSpeed = parseInt(e.raw.substr(0,3));
               e.data.acgOn = (e.raw.substr(3,1) == '1')?true:false;
            }},
    "IC":   {name:"iconStatus",
             description:"Icon and misc. status", 
             parser: function(e){
            }},
    "ID":   {description:"Radio identification"}, 
    "IF":   {name:"GeneralInformation",
             description: "General information", 
             parser: function(e){
               // e.data.frequencyVFOA = parseInt(e.raw.substr(2));
            }},
    "IO":   {description:"Internal Use Only"}, 
    "IS":   {name:"IFShift",
             description:"IF shift", 
             parser: function(e){
               //e.IFShift = e.raw..substr(2).trimLeft();
            }},
    "K2":   {name:"k2Mode",
             description:"K2 command mode", 
             parser: function(e){
               //e.k2mode = parseInt(e.raw..substr(2));
            }},
    "K3":   {name:"k3mode",
             description:"K3 command mode", 
             parser: function(e){
               //e.k2mode = parseInt(e.raw..substr(2));
            }},
    "KS":   {name:"keyerSpeed",
             description:"Keyer speed", 
             parser: function(e){
               //e.keyerSpeed = parseInt(e.raw..substr(2));
            }},
    "KT":   {description:"Internal Use Only"}, 
    "KY":   {name:"CWData",
             description:"Keyboard CW/DATA", 
             parser: function(e){
               //e.CWData = e.raw.substr(2).leftTrim();
            }},
    "LD":   {description:"Internal Use Only"}, 
    "LK":   {name:"lockVFOA",
             description:"VFO-A Lock", 
             parser: function(e){
               var lock = e.raw.substr(2);
               e.data.lockVFOA = lock=='1'?true:false;
            }},
    "LK$":  {name:"lockVFOB",
             description:"VFO-B Lock", 
             parser: function(e){
               var lock = e.raw.substr(3);
               e.data.lockVFOB = lock=='1'?true:false;
            }},
    "LN":   {name:"linkVFOs",
             description:"Link VFOs", 
             parser: function(e){
               var link = e.raw.substr(2);
               e.data.linkVFOs = link=='1'?true:false;
            }},
    "MC":   {name:"memoryChannel",
             description:"Memory channel", 
             parser: function(e){
               e.data.memoryChannel = parseInt(e.raw.substr(2));
            }},
    "MD":   {name:"operatingModeVFOA",
             description:"Operating Mode VFO-A", 
             parser: function(e){
               e.data.operatingModeVFOA = operatingMode(parseInt(e.raw.substr(2)));
            }},
    "MD$":  {name:"operatingModeVFOB",
             description:"Operating Mode VFO-B", 
             parser: function(e){
               e.data.operatingModeVFOB = operatingMode(parseInt(e.raw.substr(3)));
            }},
    "MG":   {name:"micGain",
             description:"Mic gain", 
             parser: function(e){
               e.data.micGain = parseInt(e.raw.substr(2));
            }},
    "ML":   {name:"monitorLevel",
             description:"Monitor level", 
             parser: function(e){
               e.data.micGain = parseInt(e.raw.substr(2));
            }},
    "MN":   {name:"menuSelection",
             description:"Menu entry number", 
             parser: function(e){
               // TODO this is big. Every menu item on the K3
               var menuItem = parseInt(e.raw.substr(2));
               switch(menuItem){
                 case 0: e.data.menuItem = "ALARM"; break;
                 case 1: e.data.menuItem = "IAMBIC"; break;
                 case 2: e.data.menuItem = "LCD ADJ"; break;
                 case 3: e.data.menuItem = "LCD BRT"; break;
                 case 4: e.data.menuItem = "LED BRT"; break;
                 case 5: e.data.menuItem = "MSG RPT"; break;
                 case 6: e.data.menuItem = "PADDLE"; break;
                 case 7: e.data.menuItem = "RPT OFS"; break;
                 case 8: e.data.menuItem = "RX EQ"; break;
                 case 9: e.data.menuItem = "TX EQ"; break;

                 case 10: e.data.menuItem = "VOX GN"; break;
                 case 11: e.data.menuItem = "ANTIVOX"; break;
                 case 12: e.data.menuItem = "WEIGHT"; break;
                 case 13: e.data.menuItem = "2 TONE"; break;
                 case 14: e.data.menuItem = "AFV TIM"; break;
                 case 15: e.data.menuItem = "MIC+LIN"; break;
                 case 16: e.data.menuItem = "TX DLY"; break;
                 case 17: e.data.menuItem = "AGC SLP"; break;
                 case 18: e.data.menuItem = "FM MODE"; break;
                 case 19: e.data.menuItem = "DIGOUT1"; break;

                 case 20: e.data.menuItem = "AGC HLD"; break;
                 case 21: e.data.menuItem = "FM DEV"; break;
                 case 22: e.data.menuItem = "EXT ALC"; break;
                 case 23: e.data.menuItem = "KAT3"; break;
                 case 24: e.data.menuItem = "BAT MIN"; break;
                 case 25: e.data.menuItem = "TX INH"; break;
                 case 26: e.data.menuItem = "SER NUM"; break;
                 case 27: e.data.menuItem = "TXG VCE"; break;
                 case 28: e.data.menuItem = "FW REVS"; break;
                 case 29: e.data.menuItem = "DATE"; break;

                 case 30: e.data.menuItem = "DATE MD"; break;
                 case 31: e.data.menuItem = "DDS FRQ"; break;
                 case 32: e.data.menuItem = "LIN OUT"; break;
                 case 33: e.data.menuItem = "KIO3"; break;
                 case 34: e.data.menuItem = "ADC REF"; break;
                 case 35: e.data.menuItem = "RFI DET"; break;
                 case 36: e.data.menuItem = "KDVR3"; break;
                 case 37: e.data.menuItem = "AGC-S"; break;
                 case 38: e.data.menuItem = "FLx BW"; break;
                 case 39: e.data.menuItem = "FLx FRQ"; break;

                 case 40: e.data.menuItem = "FLx GN"; break;
                 case 41: e.data.menuItem = "FLx ON"; break;
                 case 42: e.data.menuItem = "FLTX md"; break;
                 case 43: e.data.menuItem = "FP TEMP"; break;
                 case 44: e.data.menuItem = "FSK POL"; break;
                 case 45: e.data.menuItem = "AUTOINF"; break;
                 case 46: e.data.menuItem = "KBPF3"; break;
                 case 47: e.data.menuItem = "AF LIM"; break;
                 case 48: e.data.menuItem = "KNB3"; break;
                 case 49: e.data.menuItem = "AF LIM"; break;

                 case 50: e.data.menuItem = "KRX3"; break;
                 case 51: e.data.menuItem = "KXV3"; break;
                 case 52: e.data.menuItem = "LCD TST"; break;
                 case 53: e.data.menuItem = "MIC SEL"; break;
                 case 54: e.data.menuItem = "NB SAVE"; break;
                 case 55: e.data.menuItem = "KPA3"; break;
                 case 56: e.data.menuItem = "PA TEMP"; break;
                 case 57: e.data.menuItem = "RS232"; break;
                 case 58: e.data.menuItem = "TUN PWR"; break;
                 case 59: e.data.menuItem = "SYNC DT"; break;

                 case 60: e.data.menuItem = "SMTR MD"; break;
                 case 61: e.data.menuItem = "AGC-F"; break;
                 case 62: e.data.menuItem = "REF CAL"; break;
                 case 63: e.data.menuItem = "SQ MIN"; break;
                 case 64: e.data.menuItem = "SQ SUB"; break;
                 case 65: e.data.menuItem = "SMTR OF"; break;
                 case 66: e.data.menuItem = "SMTR SC"; break;
                 case 67: e.data.menuItem = "SMTR PK"; break;
                 case 68: e.data.menuItem = "SPLT SV"; break;
                 case 69: e.data.menuItem = "SPKRS"; break;

                 case 70: e.data.menuItem = "SW TEST"; break;
                 case 71: e.data.menuItem = "SW TONE"; break;
                 case 72: e.data.menuItem = "TECH MD"; break;
                 case 73: e.data.menuItem = "TIME"; break;
                 case 74: e.data.menuItem = "AGC THR"; break;
                 case 75: e.data.menuItem = "PTT RLS"; break;
                 case 76: e.data.menuItem = "BND MAP"; break;
                 case 77: e.data.menuItem = "TTY LTR"; break;
                 case 78: e.data.menuItem = "TX ALC"; break;
                 case 79: e.data.menuItem = "TXGN pwr"; break;

                 case 80: e.data.menuItem = "SUB AF"; break;
                 case 81: e.data.menuItem = "PWR SET"; break;
                 case 82: e.data.menuItem = "MIC BTN"; break;
                 case 83: e.data.menuItem = "VCO MD"; break;
                 case 84: e.data.menuItem = "VFO CTS"; break;
                 case 85: e.data.menuItem = "VFO FST"; break;
                 case 86: e.data.menuItem = "VFO IND"; break;
                 case 87: e.data.menuItem = "VFO OFS"; break;
                 case 88: e.data.menuItem = "WMTR pwr"; break;
                 case 89: e.data.menuItem = "XVx ON"; break;

                 case 90: e.data.menuItem = "XVx RF"; break;
                 case 91: e.data.menuItem = "XVx IF"; break;
                 case 92: e.data.menuItem = "XVx PWR"; break;
                 case 93: e.data.menuItem = "XVx OFS"; break;
                 case 94: e.data.menuItem = "XVx ADR"; break;
                 case 95: e.data.menuItem = "AF GAIN"; break;
                 case 96: e.data.menuItem = "TX ESSB"; break;
                 case 97: e.data.menuItem = "PSKR+PH"; break;
                 case 98: e.data.menuItem = "VFO B->A"; break;
                 case 99: e.data.menuItem = "AGC PLS"; break;

                 case 100: e.data.menuItem = "RIT CLR"; break;
                 case 101: e.data.menuItem = "TX GATE"; break;
                 case 102: e.data.menuItem = "MEM 0-9"; break;
                 case 103: e.data.menuItem = "PTT KEY"; break;
                 case 104: e.data.menuItem = "VFO CRS"; break;
                 case 105: e.data.menuItem = "AFX MD"; break;
                 case 106: e.data.menuItem = "SIG RMV"; break;
                 case 107: e.data.menuItem = "AFSK TX"; break;
                 case 108: e.data.menuItem = "AGC DCY"; break;
                 case 109: e.data.menuItem = "PB CTRL"; break;

                 case 110: e.data.menuItem = "MACRO x"; break;
                 case 111: e.data.menuItem = "L-MIX-R"; break;
                 case 112: e.data.menuItem = "CW QRQ"; break;
                 case 113: e.data.menuItem = "TX DVR"; break;
                 case 114: e.data.menuItem = "TX MON"; break;
                 case 115: e.data.menuItem = "DUAL PB"; break;
                           
                 default: e.data.menuItem = "Exit Menu";
               };
            }},
    "MP":   {name:"menuParameter",
             description:"Menu param read/set", 
             parser: function(e){
               var menuItem = parseInt(e.raw.substr(2));
               switch(menuItem){
                 case 0: e.data.menuItem = "ALARM"; break;
                 case 1: e.data.menuItem = "CW IAMBIC"; break;

                 case 5: e.data.menuItem = "MSG RPT"; break;

                 case 7: e.data.menuItem = "RPT OFS"; break;
                 case 8: e.data.menuItem = "RX EQ"; break;
                 case 9: e.data.menuItem = "TX EQ"; break;
                 case 10: e.data.menuItem = "VOX GN"; break;
                 
                 case 12: e.data.menuItem = "CW WGHT"; break;
                 case 13: e.data.menuItem = "2 TONE"; break;

                 case 18: e.data.menuItem = "FM MODE"; break;

                 case 21: e.data.menuItem = "FM DEV"; break;
                 
                 case 23: e.data.menuItem = "ATU MD"; break;
                 case 24: e.data.menuItem = "BAT MIN"; break;
                 
                 case 26: e.data.menuItem = "SER NUM"; break;
                 
                 case 28: e.data.menuItem = "FW REVS"; break;

                 case 45: e.data.menuItem = "AUTOINF"; break;
                 
                 case 47: e.data.menuItem = "AF LIM"; break;

                 case 52: e.data.menuItem = "LCD TST"; break;

                 case 57: e.data.menuItem = "RS232"; break;
                 case 58: e.data.menuItem = "TUN PWR"; break;

                 case 60: e.data.menuItem = "SMTR MD"; break;

                 case 62: e.data.menuItem = "REF CAL"; break;

                 case 70: e.data.menuItem = "SW TEST"; break;
                 case 71: e.data.menuItem = "SW TONE"; break;
                 case 72: e.data.menuItem = "TECH MD"; break;
                 case 73: e.data.menuItem = "TIME"; break;
                 case 74: e.data.menuItem = "AGC THR"; break;

                 case 76: e.data.menuItem = "BND MAP"; break;

                 case 82: e.data.menuItem = "MIC BTN"; break;

                 case 84: e.data.menuItem = "VFO CTS"; break;

                 case 87: e.data.menuItem = "VFO OFS"; break;
                 case 88: e.data.menuItem = "WATTMTR"; break;
                 case 89: e.data.menuItem = "XVx ON"; break;
                 case 90: e.data.menuItem = "XVx RF"; break;
                 case 91: e.data.menuItem = "XVx IF"; break;
                 case 92: e.data.menuItem = "XVx PWR"; break;
                 case 93: e.data.menuItem = "XVx OFS"; break;
                 case 94: e.data.menuItem = "XVx ADR"; break;
                 
                 case 96: e.data.menuItem = "TX ESSB"; break;

                 case 101: e.data.menuItem = "TX GATE"; break;

                 case 104: e.data.menuItem = "VFO CRS"; break;
                 case 105: e.data.menuItem = "AFX MD"; break;

                 case 110: e.data.menuItem = "MACRO x"; break;

                 case 120: e.data.menuItem = "CW KEY1"; break;
                 case 121: e.data.menuItem = "CW KEY2"; break;
                 case 122: e.data.menuItem = "VOX INH"; break;
                 case 123: e.data.menuItem = "RX I/Q"; break;
                 case 124: e.data.menuItem = "RX ISO"; break;
                 case 125: e.data.menuItem = "RXSBNUL"; break;
                 case 126: e.data.menuItem = "AM MODE"; break;
                 case 127: e.data.menuItem = "TXSBNUL"; break;
                 case 128: e.data.menuItem = "AGC MD"; break;
                 case 129: e.data.menuItem = "AGC SPD"; break;

                 case 130: e.data.menuItem = "TX BIAS"; break;
                 case 131: e.data.menuItem = "TX GAIN"; break;
                 case 132: e.data.menuItem = "TXCRNUL"; break;
                 case 133: e.data.menuItem = "AUTOOFF"; break;
                 case 134: e.data.menuItem = "RX XFIL"; break;
                 case 135: e.data.menuItem = "MICBIAS"; break;
                 case 136: e.data.menuItem = "PREAMP"; break;
                 case 137: e.data.menuItem = "BAT CHG"; break;
                 case 138: e.data.menuItem = "BKLIGHT"; break;
                 case 139: e.data.menuItem = "COR LVL"; break;

                 case 140: e.data.menuItem = "DUAL RX"; break;
                 case 141: e.data.menuItem = "ACC2 IO"; break;
                 case 142: e.data.menuItem = "RX SHFT"; break;
                 case 143: e.data.menuItem = "RX NR"; break;
                 case 144: e.data.menuItem = "PBT SSB"; break;
                 case 145: e.data.menuItem = "LED BRT"; break;
                 case 146: e.data.menuItem = "PA MODE"; break;
                 case 147: e.data.menuItem = "2M MODE"; break;
                           
                 default: e.data.menuItem = "Exit Menu";
               };
            }},
    "MQ":   {name:"menuParameter16", // KX3 only
             description:"Menu param read/set (16-bit)",
             parser: function(e){
               e.data.txcrnul = e.raw.substr(2);
            }}, 
    "NB":   {name:"noiseBlankerVFOA",
             description:"Noise Blanketer VFO-A", 
             parser: function(e){
               var nb = e.raw.substr(2);
               e.data.noiseBlankerVFOA = nb=='1'?true:false;
            }}, 
    "NB$":  {name:"noiseBlankerVFOB",
             description:"Noise Blanketer VFO-B",
             parser: function(e){
               var nb = e.raw.substr(3);
               e.data.noiseBlankerVFOB = nb=='1'?true:false;
            }}, 
    "NL":   {name:"noiseBlankerLevelVFOA",
             description:"Noise blanketer level VFO-A",
             parser: function(e){
               var val = e.raw.substr(2);
               e.data.noiseBlankerLevelVFOA = parseInt(val);
            }}, 
    "NL$":  {name:"noiseBlankerLevelVFOB",
             description:"Noise blanketer level VFO-B", 
             parser: function(e){
               var val = e.raw.substr(3);
               e.data.noiseBlankerLevelVFOB = parseInt(val);
            }}, 
    "OM":   {name:"optionModuleQuery",
             description:"Option Modules", 
             parser: function(e){
               // TODO
            }}, 
    "PA":   {name:"receivePreampVFOA",
             description:"RX preamp on/off VFO-A", 
             parser: function(e){
               var val = e.raw.substr(2);
               e.data.recievePreampVFOA = val=='1'?true:false;
            }}, 
    "PA$":  {name:"receivePreampVFOB",
             description:"RX preamp on/off VFO-B", 
             parser: function(e){
               var val = e.raw.substr(3);
               e.data.recievePreampVFOB = val=='1'?true:false;
            }}, 
    "PC":   {name:"requestedPowerOutputLevel",
             description:"Requested Power Output Level", 
             parser: function(e){
               var val = e.raw.substr(2);
               e.data.powerOutputLevel = val=='1'?true:false;
            }}, 
    /*"PN":   {name:"",
             description:"Internal Use Only"}, 
             parser: function(e){
               // TODO
            }}, */
    "PO":   {name:"actualPowerOutputLevel",
             description:"Actual Power Output Level", 
             parser: function(e){
               var val = e.raw.substr(2);
               e.data.powerOutputLevel = parseInt(val);
            }}, 
    "PS":   {name:"powerStatus",
             description:"Power on/off", 
             parser: function(e){
               var val = e.raw.substr(2);
               e.data.powerStatus = val=='1'?true:false;
            }}, 
    "RA":   {name:"receiveAttenuatorVFOA",
             description:"RX attenuator on/off VFO-A", 
             parser: function(e){
               var val = e.raw.substr(2);
               e.data.recieveAttenuatorVFOB = val=='1'?true:false;
            }}, 
    "RA$":  {name:"receiveAttenuatorVFOB",
             description:"RX attenuator on/off VFO-B", 
             parser: function(e){
               var val = e.raw.substr(3);
               e.data.recieveAttenuatorVFOB = val=='1'?true:false;
            }}, 
    "RC":   {name:"RITXITClear",
             description:"RIT/XIT offset clear", 
             parser: function(e){
               // no data
            }}, 
    "RD":   {name:"RITDown",
             description:"RIT down", 
             parser: function(e){
               // set only
            }}, 
    "RG":   {name:"RFGainVFOA",
             description:"RF gain VFO-A", 
             parser: function(e){
               var val = e.raw.substr(2);
               e.data.RFGainVFOA = parseInt(val);
            }}, 
    "RG$":  {name:"RFGainVFOB",
             description:"RF gain VFO-B", 
             parser: function(e){
               var val = e.raw.substr(3);
               e.data.RFGainVFOB = parseInt(val);
            }}, 
    "RO":   {name:"RITXITOffset",
             description:"RIT/XIT offset (abs)", 
             parser: function(e){
               var val = e.raw.substr(2);
               e.data.RITXITOffset = parseInt(val);
            }}, 
    "RT":   {name:"RITEnabled",
             description:"RIT on/off", 
             parser: function(e){
               var val = e.raw.substr(2);
               e.data.RITEnabled = val=='1'?true:false;
            }}, 
    "RU":   {name:"RITUp",
             description:"RIT up", 
             parser: function(e){
               // set only
            }}, 
    "RV":   {name:"firmwareRevision",
             description:"Firmware revisions", 
             parser: function(e){
               e.data.firmwareRevision = e.raw.substr(2);
            }}, 
    "RX":   {name:"receiveMode",
             description:"Enter recieve mode", 
             parser: function(e){
               // set only
            }}, 
    "SB":   {name:"dualWatchEnabled",
             description:"Sub or dual watch", 
             parser: function(e){
               var val = e.raw.substr(2);
               e.data.dualWatch = val=='1'?true:false;
            }}, 
    "SD":   {name:"semiBreakInDelay",
             description:"QSK delay", 
             parser: function(e){
               var val = e.raw.substr(2);
               e.data.semiBreakInDelay = parseInt(val);
            }}, 
    "SM":   {name:"sMeterVFOA",
             description:"S-meter VFO-A", 
             parser: function(e){
               e.data.sMeterVFOA = sMeterParseBasic(e);
            }}, 
    "SM$":  {name:"sMeterVFOB",
             description:"S-meter VFO-B", 
             parser: function(e){
               e.data.sMeterVFOB = sMeterParseBasic(e);
            }}, 
    "SMH":  {name:"highResSMeter",
             description:"High-res S-Meter",  // K3 only
             parser: function(e){
               var val = e.raw.substr(3);
               e.data.highResSMeter = val;
            }}, 
    "SP":   {name:"specialFunctions",
             description:"Internal Use Only", 
             parser: function(e){
               e.data.value = e.raw.substr(2);
            }}, 
    "SPG":  {name:"ADCGroundReference", // KX3 only
             description:"ADC ground-reference reading", 
             parser: function(e){
               // get only, response comes back as SPnnn;
            }}, 
    "SQ":   {name:"squelchLevelVFOA",
             description:"Squelch Level VFO-A", 
             parser: function(e){
               e.data.value = parseInt(e.raw.substr(2));
            }}, 
    "SQ$":  {name:"squelchLevelVFOB",
             description:"Squelch Level VFO-B", 
             parser: function(e){
               e.data.value = parseInt(e.raw.substr(3));
            }}, 
    "SWH":  {name:"switchEmulationHold",
             description:"Hold functions",  
             parser: function(e){
               // TODO model function object of Table 8
               //e.value = parseButtonHold(e);
            }}, 
    "SWT":  {name:"switchEmulationTap",
             description:"Tap functions", 
             parser: function(e){
               // TODO model function object of Table 8
               //e.value = parseButtonTap(e);
            }}, 
    "TB":   {name:"receivedText",
             description:"Buffered text", 
             parser: function(e){
               e.data.bufferedCount = e.raw[2];
               e.data.remainingCount = e.raw.substr(3,2);
               e.data.text = e.raw.substr(5);
            }}, 
    "TE":   {name:"transmitEQ",
             description:"Transmit EQ", 
             parser: function(e){
               // set only
            }}, 
    "TQ":   {name:"transmitQuery",
             description:"Transmit query",
             parser: function(e){
               var val = e.raw.substr(2);
               e.data.value = val=='1'?"transmit":"receive";
            }}, 
    "TT":   {name:"textToTerminal",
             description:"Text-to-Terminal", 
             parser: function(e){
               // set only
            }}, 
    "TX":   {name:"transmitMode",
             description:"Enter TX mode", 
             parser: function(e){
               // set only
            }}, 
    "UP":   {name:"frequencyUpVFOA",
             description:"Frequency up VFO-A", 
             parser: function(e){
               // set only
            }}, 
    "UPB":  {name:"frequencyUpVFOB",
             description:"Frequency up VFO-B", 
             parser: function(e){
               // set only
            }}, 
    "VX":   {name:"VOXEnabled",
             description:"VOX state", 
             parser: function(e){
               var val = e.raw.substr(2);
               e.data.VOXEnabled = val=='0'?true:false;
            }}, 
    "XF":   {name:"XFILSelectionVFOA",
             description:"XFIL number VFO-A", 
             parser: function(e){
               e.data.value = e.raw.substr(2);
            }}, 
    "XF$":  {name:"XFILSelectionVFOB",
             description:"XFIL number VFO-B", 
             parser: function(e){
               e.data.value = e.raw.substr(3);
            }}, 
    "XT":   {name:"XITEnabled",
             description:"XIT on/off",
             parser: function(e){
               var val = e.raw.substr(2);
               e.data.XITEnabled = val=='1'?true:false;
            }} 
  }

  function operatingMode(e){
    switch(e){
      case 1:
        return 'LSB';
      case 2:
        return 'USB';
      case 3:
        return 'CW';
      case 4:
        return 'FM';
      case 5:
        return 'AM';
      case 6:
        return 'DATA';
      case 7:
        return 'CW-REV';
      case 9:
        return 'DATA-REV';
    }
  }

  function bandChangeUpDown(e){
    switch(parseInt(e.raw)){
      case 0:
        e.data.band = 160;
        break;
      case 2:
        e.data.band = 80;
        break;
      case 3:
        e.data.band = 40;
        break;
      case 4:
        e.data.band = 30;
        break;
      case 5:
        e.data.band = 20;
        break;
      case 6:
        e.data.band = 17;
        break;
      case 7:
        e.data.band = 15;
        break;
      case 8:
        e.data.band = 12;
        break;
      case 9:
        e.data.band = 10;
        break;
      case 10:
        e.data.band = 6;
        break;
      default:
        if( e.data.band >= 11 && e.data.band <= 15 ){
          // reserved for expansion
          e.data.band = null;
        }
        if( e.data.band >= 16 && e.data.band <= 24 ){
          e.data.band = "Xvtr band #"+e.band-15; // ?? Not sure
        }
    } // end switch
  }

  function vfoUpDown(e){
    // e.data.delta is in Hz
    switch(parseInt(e.raw)){
      case 0:
        e.data.delta = 1;
        break;
      case 1:
        e.data.delta = 10;
        break;
      case 2:
        e.data.delta = 20;
        break;
      case 3:
        e.data.delta = 50;
        break;
      case 4:
        e.data.delta = 1000;
        break;
      case 5:
        e.data.delta = 2000;
        break;
      case 6:
        e.data.delta = 3000;
        break;
      case 7:
        e.data.delta = 5000;
        break;
      case 8:
        e.data.delta = 100;
        break;
      case 9:
        e.data.delta = 200;
        break;
    }
  }

  function sMeterParseBasic(e){
    // basic format SM$nnnn
    var val = parseInt(e.raw.substr(2)); 
    if( e.raw[2] == '$' )
      val = parseInt(e.raw.substr(3));

    switch( val ){
      case 6:
        e.data.sMeter = "S9";
        break;
      case 9:
        e.data.sMeter = "S9+20";
        break;
      case 12:
        e.data.sMeter = "S9+40";
        break;
      case 15:
        e.data.sMeter = "S9+60";
        break;
      default:
        e.data.sMeter = val;
    }
  }

}

util.inherits(Elecraft, EventEmitter);

module.exports = new Elecraft();

