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

                 log.debug( thisChar+' '+binaryValue+' '+charCode );
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
             description:"Receive VFO select", 
             parser: function(e){
               e.receiveVFO = e.data;
            }},
    "FT":   {name:"transmitVFO",
             description:"Transmit VFO select", 
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
    "GT":   {name:"agcSpeed",
             description:"AGC speed on/off", 
             parser: function(e){
               e.agcSpeed = parseInt(e.data.substr(0,3));
               e.acgOn = (e.data.substr(3,1) == '1')?true:false;
            }},
    "IC":   {name:"iconStatus",
             description:"Icon and misc. status", 
             parser: function(e){
            }},
    "ID":   {description:"Radio identification"}, 
    "IF":   {name:"GeneralInformation",
             description: "General information", 
             parser: function(e){
               e.frequencyVFOA=14.268000; // TODO this is obviously wrong
            }},
    "IO":   {description:"Internal Use Only"}, 
    "IS":   {name:"IFShift",
             description:"IF shift", 
             parser: function(e){
               e.IFShift = e.data..substr(2).trimLeft();
            }},
    "K2":   {name:"k2Mode",
             description:"K2 command mode", 
             parser: function(e){
               e.k2mode = parseInt(e.data..substr(2));
            }},
    "K3":   {name:"k3mode",
             description:"K3 command mode", 
             parser: function(e){
               e.k2mode = parseInt(e.data..substr(2));
            }},
    "KS":   {name:"keyerSpeed",
             description:"Keyer speed", 
             parser: function(e){
               e.keyerSpeed = parseInt(e.data..substr(2));
            }},
    "KT":   {description:"Internal Use Only"}, 
    "KY":   {name:"CWData",
             description:"Keyboard CW/DATA", 
             parser: function(e){
               e.CWData = e.data.substr(2).leftTrim();
            }},
    "LD":   {description:"Internal Use Only"}, 
    "LK":   {name:"lockVFOA",
             description:"VFO-A Lock", 
             parser: function(e){
               var lock = e.data.substr(2);
               e.lockVFOA = lock=='1'?true:false;
            }},
    "LK$":  {name:"lockVFOB",
             description:"VFO-B Lock", 
             parser: function(e){
               var lock = e.data.substr(2);
               e.lockVFOB = lock=='1'?true:false;
            }},
    "LN":   {name:"linkVFOs",
             description:"Link VFOs", 
             parser: function(e){
               var link = e.data.substr(2);
               e.linkVFOs = link=='1'?true:false;
            }},
    "MC":   {name:"memoryChannel",
             description:"Memory channel", 
             parser: function(e){
               e.memoryChannel = parseInt(e.data.substr(2));
            }},
    "MD":   {name:"operatingModeVFOA",
             description:"Operating Mode VFO-A", 
             parser: function(e){
               e.operatingModeVFOA = operatingMode(parseInt(e.data.substr(2)));
            }},
    "MD$":  {name:"operatingModeVFOB",
             description:"Operating Mode VFO-B", 
             parser: function(e){
               e.operatingModeVFOB = operatingMode(parseInt(e.data.substr(2)));
            }},
    "MG":   {name:"micGain",
             description:"Mic gain", 
             parser: function(e){
               e.micGain = parseInt(e.data.substr(2));
            }},
    "ML":   {name:"monitorLevel",
             description:"Monitor level", 
             parser: function(e){
               e.micGain = parseInt(e.data.substr(2));
            }},
    "MN":   {name:"menuSelection",
             description:"Menu entry number", 
             parser: function(e){
               // TODO this is big. Every menu item on the K3
               var menuItem = parseInt(e.data.substr(2));
               switch(menuItem){
                 case 0: e.menuItem = "ALARM"; break;
                 case 1: e.menuItem = "IAMBIC"; break;
                 case 2: e.menuItem = "LCD ADJ"; break;
                 case 3: e.menuItem = "LCD BRT"; break;
                 case 4: e.menuItem = "LED BRT"; break;
                 case 5: e.menuItem = "MSG RPT"; break;
                 case 6: e.menuItem = "PADDLE"; break;
                 case 7: e.menuItem = "RPT OFS"; break;
                 case 8: e.menuItem = "RX EQ"; break;
                 case 9: e.menuItem = "TX EQ"; break;

                 case 10: e.menuItem = "VOX GN"; break;
                 case 11: e.menuItem = "ANTIVOX"; break;
                 case 12: e.menuItem = "WEIGHT"; break;
                 case 13: e.menuItem = "2 TONE"; break;
                 case 14: e.menuItem = "AFV TIM"; break;
                 case 15: e.menuItem = "MIC+LIN"; break;
                 case 16: e.menuItem = "TX DLY"; break;
                 case 17: e.menuItem = "AGC SLP"; break;
                 case 18: e.menuItem = "FM MODE"; break;
                 case 19: e.menuItem = "DIGOUT1"; break;

                 case 20: e.menuItem = "AGC HLD"; break;
                 case 21: e.menuItem = "FM DEV"; break;
                 case 22: e.menuItem = "EXT ALC"; break;
                 case 23: e.menuItem = "KAT3"; break;
                 case 24: e.menuItem = "BAT MIN"; break;
                 case 25: e.menuItem = "TX INH"; break;
                 case 26: e.menuItem = "SER NUM"; break;
                 case 27: e.menuItem = "TXG VCE"; break;
                 case 28: e.menuItem = "FW REVS"; break;
                 case 29: e.menuItem = "DATE"; break;

                 case 30: e.menuItem = "DATE MD"; break;
                 case 31: e.menuItem = "DDS FRQ"; break;
                 case 32: e.menuItem = "LIN OUT"; break;
                 case 33: e.menuItem = "KIO3"; break;
                 case 34: e.menuItem = "ADC REF"; break;
                 case 35: e.menuItem = "RFI DET"; break;
                 case 36: e.menuItem = "KDVR3"; break;
                 case 37: e.menuItem = "AGC-S"; break;
                 case 38: e.menuItem = "FLx BW"; break;
                 case 39: e.menuItem = "FLx FRQ"; break;

                 case 40: e.menuItem = "FLx GN"; break;
                 case 41: e.menuItem = "FLx ON"; break;
                 case 42: e.menuItem = "FLTX md"; break;
                 case 43: e.menuItem = "FP TEMP"; break;
                 case 44: e.menuItem = "FSK POL"; break;
                 case 45: e.menuItem = "AUTOINF"; break;
                 case 46: e.menuItem = "KBPF3"; break;
                 case 47: e.menuItem = "AF LIM"; break;
                 case 48: e.menuItem = "KNB3"; break;
                 case 49: e.menuItem = "AF LIM"; break;

                 case 50: e.menuItem = "KRX3"; break;
                 case 51: e.menuItem = "KXV3"; break;
                 case 52: e.menuItem = "LCD TST"; break;
                 case 53: e.menuItem = "MIC SEL"; break;
                 case 54: e.menuItem = "NB SAVE"; break;
                 case 55: e.menuItem = "KPA3"; break;
                 case 56: e.menuItem = "PA TEMP"; break;
                 case 57: e.menuItem = "RS232"; break;
                 case 58: e.menuItem = "TUN PWR"; break;
                 case 59: e.menuItem = "SYNC DT"; break;

                 case 60: e.menuItem = "SMTR MD"; break;
                 case 61: e.menuItem = "AGC-F"; break;
                 case 62: e.menuItem = "REF CAL"; break;
                 case 63: e.menuItem = "SQ MIN"; break;
                 case 64: e.menuItem = "SQ SUB"; break;
                 case 65: e.menuItem = "SMTR OF"; break;
                 case 66: e.menuItem = "SMTR SC"; break;
                 case 67: e.menuItem = "SMTR PK"; break;
                 case 68: e.menuItem = "SPLT SV"; break;
                 case 69: e.menuItem = "SPKRS"; break;

                 case 70: e.menuItem = "SW TEST"; break;
                 case 71: e.menuItem = "SW TONE"; break;
                 case 72: e.menuItem = "TECH MD"; break;
                 case 73: e.menuItem = "TIME"; break;
                 case 74: e.menuItem = "AGC THR"; break;
                 case 75: e.menuItem = "PTT RLS"; break;
                 case 76: e.menuItem = "BND MAP"; break;
                 case 77: e.menuItem = "TTY LTR"; break;
                 case 78: e.menuItem = "TX ALC"; break;
                 case 79: e.menuItem = "TXGN pwr"; break;

                 case 80: e.menuItem = "SUB AF"; break;
                 case 81: e.menuItem = "PWR SET"; break;
                 case 82: e.menuItem = "MIC BTN"; break;
                 case 83: e.menuItem = "VCO MD"; break;
                 case 84: e.menuItem = "VFO CTS"; break;
                 case 85: e.menuItem = "VFO FST"; break;
                 case 86: e.menuItem = "VFO IND"; break;
                 case 87: e.menuItem = "VFO OFS"; break;
                 case 88: e.menuItem = "WMTR pwr"; break;
                 case 89: e.menuItem = "XVx ON"; break;

                 case 90: e.menuItem = "XVx RF"; break;
                 case 91: e.menuItem = "XVx IF"; break;
                 case 92: e.menuItem = "XVx PWR"; break;
                 case 93: e.menuItem = "XVx OFS"; break;
                 case 94: e.menuItem = "XVx ADR"; break;
                 case 95: e.menuItem = "AF GAIN"; break;
                 case 96: e.menuItem = "TX ESSB"; break;
                 case 97: e.menuItem = "PSKR+PH"; break;
                 case 98: e.menuItem = "VFO B->A"; break;
                 case 99: e.menuItem = "AGC PLS"; break;

                 case 100: e.menuItem = "RIT CLR"; break;
                 case 101: e.menuItem = "TX GATE"; break;
                 case 102: e.menuItem = "MEM 0-9"; break;
                 case 103: e.menuItem = "PTT KEY"; break;
                 case 104: e.menuItem = "VFO CRS"; break;
                 case 105: e.menuItem = "AFX MD"; break;
                 case 106: e.menuItem = "SIG RMV"; break;
                 case 107: e.menuItem = "AFSK TX"; break;
                 case 108: e.menuItem = "AGC DCY"; break;
                 case 109: e.menuItem = "PB CTRL"; break;

                 case 110: e.menuItem = "MACRO x"; break;
                 case 111: e.menuItem = "L-MIX-R"; break;
                 case 112: e.menuItem = "CW QRQ"; break;
                 case 113: e.menuItem = "TX DVR"; break;
                 case 114: e.menuItem = "TX MON"; break;
                 case 115: e.menuItem = "DUAL PB"; break;
                           
                 default: e.menuItem = "Exit Menu";
               };
            }},
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


