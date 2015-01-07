
var assert = require('assert'),
    blanket = require('blanket')({
      pattern: function (filename) {
        return !/node_modules/.test(filename);
      }
    }),
    kx = require('../src/elecraft.js');

describe('Elecraft', function(){
  describe('#list()', function(){
    it('should return a list of serial ports', function(){
      kx.list(function(ports){
        assert.equal(true, Array.isArray( ports ));
      });
    })
  });
  describe('#processCommand("?")', function(){
    it('should emit a "busy" event', function(done){
      kx.on('busy', function(e){
        done();
      });
      kx.processCommand('?');
    });
  });
  describe('#processCommand("AG")', function(){
    it('should emit a "AFGainVFOA" event', function(done){
      kx.on('AFGainVFOA', function(e){
        done();
      });
      kx.processCommand('AG');
    });
  });
  describe('#processCommand("AG$")', function(){
    it('should emit a "AFGainVFOB" event', function(done){
      kx.on('AFGainVFOB', function(e){
        done();
      });
      kx.processCommand('AG$');
    });
  });
  describe('#processCommand("AI")', function(){
    it('should emit a "AutoInfoMode" event', function(done){
      kx.on('AutoInfoMode', function(e){
        done();
      });
      kx.processCommand('AI');
    });
  });
  describe('#processCommand("AN")', function(){
    it('should emit a "antennaSelection" event', function(done){
      kx.on('antennaSelection', function(e){
        done();
      });
      kx.processCommand('AN');
    });
  });
  describe('#processCommand("BG")', function(){
    it('should emit a "bargraph" event', function(done){
      kx.on('bargraph', function(e){
        done();
      });
      kx.processCommand('BG');
    });
  });
  describe('#processCommand("BN")', function(){
    it('should emit a "bandChangeVFOA" event', function(done){
      kx.on('bandChangeVFOA', function(e){
        done();
      });
      kx.processCommand('BN');
    });
  });
  describe('#processCommand("BN$")', function(){
    it('should emit a "bandChangeVFOB" event', function(done){
      kx.on('bandChangeVFOB', function(e){
        done();
      });
      kx.processCommand('BN$');
    });
  });
  describe('#processCommand("BR0")', function(){
    it('should emit a "baudRate" event', function(done){
      kx.on('baudRate', function(e){
        if( e.baudRate === 4800 )
          done();
      });
      kx.processCommand('BR0');
    });
  });
  describe('#processCommand("BR2")', function(){
    it('should emit a "baudRate" event', function(done){
      kx.on('baudRate', function(e){
        if( e.baudRate === 9600 )
          done();
      });
      kx.processCommand('BR2');
    });
  });
  describe('#processCommand("BR3")', function(){
    it('should emit a "baudRate" event', function(done){
      kx.on('baudRate', function(e){
        if( e.baudRate === 38400 )
          done();
      });
      kx.processCommand('BR3');
    });
  });
  describe('#processCommand("BW")', function(){
    it('should emit a "filterBandwidthVFOA" event', function(done){
      kx.on('filterBandwidthVFOA', function(e){
        done();
      });
      kx.processCommand('BW');
    });
  });
  describe('#processCommand("BW$")', function(){
    it('should emit a "filterBandwidthVFOB" event', function(done){
      kx.on('filterBandwidthVFOB', function(e){
        done();
      });
      kx.processCommand('BW$');
    });
  });
  describe('#processCommand("CP")', function(){
    it('should emit a "speechCompression" event', function(done){
      kx.on('speechCompression', function(e){
        done();
      });
      kx.processCommand('CP');
    });
  });
  describe('#processCommand("CW")', function(){
    it('should emit a "sidetonePitch" event', function(done){
      kx.on('sidetonePitch', function(e){
        done();
      });
      kx.processCommand('CW');
    });
  });
  describe('#processCommand("DB")', function(){
    it('should emit a "displayVFOB" event', function(done){
      kx.on('displayVFOB', function(e){
        done();
      });
      kx.processCommand('DB');
    });
  });
  describe('#processCommand("DL2")', function(){
    it('should emit a "dspCommandTrace" event', function(done){
      kx.on('dspCommandTrace', function(e){
        if( !e.dspDebug )
          done();
      });
      kx.processCommand('DL2');
    });
  });
  describe('#processCommand("DL3")', function(){
    it('should emit a "dspCommandTrace" event', function(done){
      kx.on('dspCommandTrace', function(e){
        if( e.dspDebug )
          done();
      });
      kx.processCommand('DL3');
    });
  });
  describe('#processCommand("DN")', function(){
    it('should emit a "downVFOA" event', function(done){
      kx.on('downVFOA', function(e){
        done();
      });
      kx.processCommand('DN');
    });
  });
  describe('#processCommand("DNB")', function(){
    it('should emit a "downVFOB" event', function(done){
      kx.on('downVFOB', function(e){
        done();
      });
      kx.processCommand('DNB');
    });
  });
  describe('#processCommand("DS")', function(){
    it('should emit a "displayVFOA" event', function(done){
      kx.on('displayVFOA', function(e){
        done();
      });
      kx.processCommand('DS');
    });
  });
  describe('#processCommand("DT0")', function(){
    it('should emit a "dataMode" event', function(done){
      kx.on('dataMode', function(e){
        if( e.dataMode === 'DATA A' )
          done();
      });
      kx.processCommand('DT0');
    });
  });
  describe('#processCommand("DT1")', function(){
    it('should emit a "dataMode" event', function(done){
      kx.on('dataMode', function(e){
        if( e.dataMode === 'AFSK A' )
          done();
      });
      kx.processCommand('DT1');
    });
  });
  describe('#processCommand("DT2")', function(){
    it('should emit a "dataMode" event', function(done){
      kx.on('dataMode', function(e){
        if( e.dataMode === 'FSK D' )
          done();
      });
      kx.processCommand('DT2');
    });
  });
  describe('#processCommand("DT3")', function(){
    it('should emit a "dataMode" event', function(done){
      kx.on('dataMode', function(e){
        if( e.dataMode === 'PSK D' )
          done();
      });
      kx.processCommand('DT3');
    });
  });
  describe('#processCommand("DV")', function(){
    it('should emit a "diversityModeOn" event', function(done){
      kx.on('diversityModeOn', function(e){
        done();
      });
      kx.processCommand('DV');
    });
  });
  describe('#processCommand("EL")', function(){
    it('should emit a "errorLoggingOn" event', function(done){
      kx.on('errorLoggingOn', function(e){
        done();
      });
      kx.processCommand('EL');
    });
  });
  describe('#processCommand("ES")', function(){
    it('should emit a "essbModeOn" event', function(done){
      kx.on('essbModeOn', function(e){
        done();
      });
      kx.processCommand('ES');
    });
  });
  describe('#processCommand("FA")', function(){
    it('should emit a "frequencyVFOA" event', function(done){
      kx.on('frequencyVFOA', function(e){
        done();
      });
      kx.processCommand('FA');
    });
  });
  describe('#processCommand("FB")', function(){
    it('should emit a "frequencyVFOB" event', function(done){
      kx.on('frequencyVFOB', function(e){
        done();
      });
      kx.processCommand('FB');
    });
  });
  describe('#processCommand("FI")', function(){
    it('should emit a "IFCenterFrequency" event', function(done){
      kx.on('IFCenterFrequency', function(e){
        done();
      });
      kx.processCommand('FI');
    });
  });
  describe('#processCommand("FR")', function(){
    it('should emit a "receiveVFO" event', function(done){
      kx.on('receiveVFO', function(e){
        done();
      });
      kx.processCommand('FR');
    });
  });
  describe('#processCommand("FT")', function(){
    it('should emit a "transmitVFO" event', function(done){
      kx.on('transmitVFO', function(e){
        done();
      });
      kx.processCommand('FT');
    });
  });
  /* Deprecated. Use 'BW'.
  describe('#processCommand("FW")', function(){
    it('should emit a "filterBandwidthVFOA" event', function(done){
      kx.on('filterBandwidthVFOA', function(e){
        done();
      });
      kx.processCommand('FW');
    });
  });
  describe('#processCommand("FW$")', function(){
    it('should emit a "filterBandwidthVFOB" event', function(done){
      kx.on('filterBandwidthVFOB', function(e){
        done();
      });
      kx.processCommand('FW$');
    });
  }); */
  describe('#processCommand("GT")', function(){
    it('should emit a "agcSpeed" event', function(done){
      kx.on('agcSpeed', function(e){
        done();
      });
      kx.processCommand('GT');
    });
  });
  describe('#processCommand("IC")', function(){
    it('should emit a "iconStatus" event', function(done){
      kx.on('iconStatus', function(e){
        done();
      });
      kx.processCommand('IC');
    });
  });
  describe('#processCommand("IF")', function(){
    it('should emit a "GeneralInformation" event', function(done){
      kx.on('GeneralInformation', function(e){
        done();
      });
      kx.processCommand('IF');
    });
  });
  describe('#processCommand("IS")', function(){
    it('should emit a "IFShift" event', function(done){
      kx.on('IFShift', function(e){
        done();
      });
      kx.processCommand('IS');
    });
  });
  describe('#processCommand("K2")', function(){
    it('should emit a "k2Mode" event', function(done){
      kx.on('k2Mode', function(e){
        done();
      });
      kx.processCommand('K2');
    });
  });
  describe('#processCommand("K3")', function(){
    it('should emit a "k3mode" event', function(done){
      kx.on('k3mode', function(e){
        done();
      });
      kx.processCommand('K3');
    });
  });
  describe('#processCommand("KS")', function(){
    it('should emit a "keyerSpeed" event', function(done){
      kx.on('keyerSpeed', function(e){
        done();
      });
      kx.processCommand('KS');
    });
  });
  describe('#processCommand("KY")', function(){
    it('should emit a "CWData" event', function(done){
      kx.on('CWData', function(e){
        done();
      });
      kx.processCommand('KY');
    });
  });
  describe('#processCommand("LK")', function(){
    it('should emit a "lockVFOA" event', function(done){
      kx.on('lockVFOA', function(e){
        done();
      });
      kx.processCommand('LK');
    });
  });
  describe('#processCommand("LK$")', function(){
    it('should emit a "lockVFOB" event', function(done){
      kx.on('lockVFOB', function(e){
        done();
      });
      kx.processCommand('LK$');
    });
  });
  describe('#processCommand("LN")', function(){
    it('should emit a "linkVFOs" event', function(done){
      kx.on('linkVFOs', function(e){
        done();
      });
      kx.processCommand('LN');
    });
  });
  describe('#processCommand("MC")', function(){
    it('should emit a "memoryChannel" event', function(done){
      kx.on('memoryChannel', function(e){
        done();
      });
      kx.processCommand('MC');
    });
  });
  describe('#processCommand("MD1")', function(){
    it('should emit a "operatingModeVFOA" event', function(done){
      kx.on('operatingModeVFOA', function(e){
        if( e.operatingModeVFOA === 'LSB')
          done();
      });
      kx.processCommand('MD1');
    });
  });
  describe('#processCommand("MD2")', function(){
    it('should emit a "operatingModeVFOA" event', function(done){
      kx.on('operatingModeVFOA', function(e){
        if( e.operatingModeVFOA === 'USB')
          done();
      });
      kx.processCommand('MD2');
    });
  });
  describe('#processCommand("MD3")', function(){
    it('should emit a "operatingModeVFOA" event', function(done){
      kx.on('operatingModeVFOA', function(e){
        if( e.operatingModeVFOA === 'CW')
          done();
      });
      kx.processCommand('MD3');
    });
  });
  describe('#processCommand("MD4")', function(){
    it('should emit a "operatingModeVFOA" event', function(done){
      kx.on('operatingModeVFOA', function(e){
        if( e.operatingModeVFOA === 'FM')
          done();
      });
      kx.processCommand('MD4');
    });
  });
  describe('#processCommand("MD5")', function(){
    it('should emit a "operatingModeVFOA" event', function(done){
      kx.on('operatingModeVFOA', function(e){
        if( e.operatingModeVFOA === 'AM')
          done();
      });
      kx.processCommand('MD5');
    });
  });
  describe('#processCommand("MD6")', function(){
    it('should emit a "operatingModeVFOA" event', function(done){
      kx.on('operatingModeVFOA', function(e){
        if( e.operatingModeVFOA === 'DATA')
          done();
      });
      kx.processCommand('MD6');
    });
  });
  describe('#processCommand("MD7")', function(){
    it('should emit a "operatingModeVFOA" event', function(done){
      kx.on('operatingModeVFOA', function(e){
        if( e.operatingModeVFOA === 'CW-REV')
          done();
      });
      kx.processCommand('MD7');
    });
  });
  describe('#processCommand("MD9")', function(){
    it('should emit a "operatingModeVFOA" event', function(done){
      kx.on('operatingModeVFOA', function(e){
        if( e.operatingModeVFOA === 'DATA-REV')
          done();
      });
      kx.processCommand('MD9');
    });
  });
  describe('#processCommand("MD$")', function(){
    it('should emit a "operatingModeVFOB" event', function(done){
      kx.on('operatingModeVFOB', function(e){
        done();
      });
      kx.processCommand('MD$');
    });
  });
  describe('#processCommand("MG")', function(){
    it('should emit a "micGain" event', function(done){
      kx.on('micGain', function(e){
        done();
      });
      kx.processCommand('MG');
    });
  });
  describe('#processCommand("ML")', function(){
    it('should emit a "monitorLevel" event', function(done){
      kx.on('monitorLevel', function(e){
        done();
      });
      kx.processCommand('ML');
    });
  });
  describe('#processCommand("MN")', function(){
    it('should emit a "menuSelection" event', function(done){
      kx.on('menuSelection', function(e){
        done();
      });
      kx.processCommand('MN');
    });
  });
  describe('#processCommand("MP")', function(){
    it('should emit a "menuParameter" event', function(done){
      kx.on('menuParameter', function(e){
        done();
      });
      kx.processCommand('MP');
    });
  });
  describe('#processCommand("MQ")', function(){
    it('should emit a "menuParameter16" event', function(done){
      kx.on('menuParameter16', function(e){
        done();
      });
      kx.processCommand('MQ');
    });
  });
  describe('#processCommand("NB")', function(){
    it('should emit a "noiseBlankerVFOA" event', function(done){
      kx.on('noiseBlankerVFOA', function(e){
        done();
      });
      kx.processCommand('NB');
    });
  });
  describe('#processCommand("NB$")', function(){
    it('should emit a "noiseBlankerVFOA" event', function(done){
      kx.on('noiseBlankerVFOB', function(e){
        done();
      });
      kx.processCommand('NB$');
    });
  });
  describe('#processCommand("NL")', function(){
    it('should emit a "noiseBlankerLevelVFOA" event', function(done){
      kx.on('noiseBlankerLevelVFOA', function(e){
        done();
      });
      kx.processCommand('NL');
    });
  });
  describe('#processCommand("NL$")', function(){
    it('should emit a "noiseBlankerLevelVFOB" event', function(done){
      kx.on('noiseBlankerLevelVFOB', function(e){
        done();
      });
      kx.processCommand('NL$');
    });
  });
  describe('#processCommand("OM")', function(){
    it('should emit a "optionModuleQuery" event', function(done){
      kx.on('optionModuleQuery', function(e){
        done();
      });
      kx.processCommand('OM');
    });
  });
  describe('#processCommand("PA")', function(){
    it('should emit a "receivePreampVFOA" event', function(done){
      kx.on('receivePreampVFOA', function(e){
        done();
      });
      kx.processCommand('PA');
    });
  });
  describe('#processCommand("PA$")', function(){
    it('should emit a "receivePreampVFOB" event', function(done){
      kx.on('receivePreampVFOB', function(e){
        done();
      });
      kx.processCommand('PA$');
    });
  });
  describe('#processCommand("PC")', function(){
    it('should emit a "requestedPowerOutputLevel" event', function(done){
      kx.on('requestedPowerOutputLevel', function(e){
        done();
      });
      kx.processCommand('PC');
    });
  });
  describe('#processCommand("PO")', function(){
    it('should emit a "actualPowerOutputLevel" event', function(done){
      kx.on('actualPowerOutputLevel', function(e){
        done();
      });
      kx.processCommand('PO');
    });
  });
  describe('#processCommand("PS")', function(){
    it('should emit a "powerStatus" event', function(done){
      kx.on('powerStatus', function(e){
        done();
      });
      kx.processCommand('PS');
    });
  });
  describe('#processCommand("RA")', function(){
    it('should emit a "receiveAttenuatorVFOA" event', function(done){
      kx.on('receiveAttenuatorVFOA', function(e){
        done();
      });
      kx.processCommand('RA');
    });
  });
  describe('#processCommand("RA$")', function(){
    it('should emit a "receiveAttenuatorVFOB" event', function(done){
      kx.on('receiveAttenuatorVFOB', function(e){
        done();
      });
      kx.processCommand('RA$');
    });
  });
  describe('#processCommand("RC")', function(){
    it('should emit a "RITXITClear" event', function(done){
      kx.on('RITXITClear', function(e){
        done();
      });
      kx.processCommand('RC');
    });
  });
  describe('#processCommand("RD")', function(){
    it('should emit a "RITDown" event', function(done){
      kx.on('RITDown', function(e){
        done();
      });
      kx.processCommand('RD');
    });
  });
  describe('#processCommand("RG")', function(){
    it('should emit a "RFGainVFOA" event', function(done){
      kx.on('RFGainVFOA', function(e){
        done();
      });
      kx.processCommand('RG');
    });
  });
  describe('#processCommand("RG$")', function(){
    it('should emit a "RFGainVFOB" event', function(done){
      kx.on('RFGainVFOB', function(e){
        done();
      });
      kx.processCommand('RG$');
    });
  });
  describe('#processCommand("RO")', function(){
    it('should emit a "RITXITOffset" event', function(done){
      kx.on('RITXITOffset', function(e){
        done();
      });
      kx.processCommand('RO');
    });
  });
  describe('#processCommand("RT")', function(){
    it('should emit a "RITEnabled" event', function(done){
      kx.on('RITEnabled', function(e){
        done();
      });
      kx.processCommand('RT');
    });
  });
  describe('#processCommand("RU")', function(){
    it('should emit a "RITUp" event', function(done){
      kx.on('RITUp', function(e){
        done();
      });
      kx.processCommand('RU');
    });
  });
  describe('#processCommand("RV")', function(){
    it('should emit a "firmwareRevision" event', function(done){
      kx.on('firmwareRevision', function(e){
        done();
      });
      kx.processCommand('RV');
    });
  });
  describe('#processCommand("RX")', function(){
    it('should emit a "receiveMode" event', function(done){
      kx.on('receiveMode', function(e){
        done();
      });
      kx.processCommand('RX');
    });
  });
  describe('#processCommand("SB")', function(){
    it('should emit a "dualWatchEnabled" event', function(done){
      kx.on('dualWatchEnabled', function(e){
        done();
      });
      kx.processCommand('SB');
    });
  });
  describe('#processCommand("SD")', function(){
    it('should emit a "semiBreakInDelay" event', function(done){
      kx.on('semiBreakInDelay', function(e){
        done();
      });
      kx.processCommand('SD');
    });
  });
  describe('#processCommand("SM")', function(){
    it('should emit a "sMeterVFOA" event', function(done){
      kx.on('sMeterVFOA', function(e){
        done();
      });
      kx.processCommand('SM');
    });
  });
  describe('#processCommand("SM$")', function(){
    it('should emit a "sMeterVFOB" event', function(done){
      kx.on('sMeterVFOB', function(e){
        done();
      });
      kx.processCommand('SM$');
    });
  });
  describe('#processCommand("SMH")', function(){
    it('should emit a "highResSMeter" event', function(done){
      kx.on('highResSMeter', function(e){
        done();
      });
      kx.processCommand('SMH');
    });
  });
  describe('#processCommand("SP")', function(){
    it('should emit a "specialFunctions" event', function(done){
      kx.on('specialFunctions', function(e){
        done();
      });
      kx.processCommand('SP');
    });
  });
  describe('#processCommand("SPG")', function(){
    it('should emit a "ADCGroundReference" event', function(done){
      kx.on('ADCGroundReference', function(e){
        done();
      });
      kx.processCommand('SPG');
    });
  });
  describe('#processCommand("SQ")', function(){
    it('should emit a "squelchLevelVFOA" event', function(done){
      kx.on('squelchLevelVFOA', function(e){
        done();
      });
      kx.processCommand('SQ');
    });
  });
  describe('#processCommand("SQ$")', function(){
    it('should emit a "squelchLevelVFOB" event', function(done){
      kx.on('squelchLevelVFOB', function(e){
        done();
      });
      kx.processCommand('SQ$');
    });
  });
  describe('#processCommand("SWH")', function(){
    it('should emit a "switchEmulationHold" event', function(done){
      kx.on('switchEmulationHold', function(e){
        done();
      });
      kx.processCommand('SWH');
    });
  });
  describe('#processCommand("SWT")', function(){
    it('should emit a "switchEmulationTap" event', function(done){
      kx.on('switchEmulationTap', function(e){
        done();
      });
      kx.processCommand('SWT');
    });
  });
  describe('#processCommand("TB")', function(){
    it('should emit a "receivedText" event', function(done){
      kx.on('receivedText', function(e){
        done();
      });
      kx.processCommand('TB');
    });
  });
  describe('#processCommand("TE")', function(){
    it('should emit a "transmitEQ" event', function(done){
      kx.on('transmitEQ', function(e){
        done();
      });
      kx.processCommand('TE');
    });
  });
  describe('#processCommand("TQ")', function(){
    it('should emit a "transmitQuery" event', function(done){
      kx.on('transmitQuery', function(e){
        done();
      });
      kx.processCommand('TQ');
    });
  });
  describe('#processCommand("TT")', function(){
    it('should emit a "textToTerminal" event', function(done){
      kx.on('textToTerminal', function(e){
        done();
      });
      kx.processCommand('TT');
    });
  });
  describe('#processCommand("TX")', function(){
    it('should emit a "transmitMode" event', function(done){
      kx.on('transmitMode', function(e){
        done();
      });
      kx.processCommand('TX');
    });
  });
  describe('#processCommand("UP")', function(){
    it('should emit a "frequencyUpVFOA" event', function(done){
      kx.on('frequencyUpVFOA', function(e){
        done();
      });
      kx.processCommand('UP');
    });
  });
  describe('#processCommand("UPB")', function(){
    it('should emit a "frequencyUpVFOB" event', function(done){
      kx.on('frequencyUpVFOB', function(e){
        done();
      });
      kx.processCommand('UPB');
    });
  });
  describe('#processCommand("VX")', function(){
    it('should emit a "VOXEnabled" event', function(done){
      kx.on('VOXEnabled', function(e){
        done();
      });
      kx.processCommand('VX');
    });
  });
  describe('#processCommand("XF")', function(){
    it('should emit a "XFILSelectionVFOA" event', function(done){
      kx.on('XFILSelectionVFOA', function(e){
        done();
      });
      kx.processCommand('XF');
    });
  });
  describe('#processCommand("XF$")', function(){
    it('should emit a "XFILSelectionVFOB" event', function(done){
      kx.on('XFILSelectionVFOB', function(e){
        done();
      });
      kx.processCommand('XF$');
    });
  });
  describe('#processCommand("XT")', function(){
    it('should emit a "XITEnabled" event', function(done){
      kx.on('XITEnabled', function(e){
        done();
      });
      kx.processCommand('XT');
    });
  });
});


//kx.connect();
/*
kx.on('GeneralInformation', function(e){
  console.log( e );
});
kx.processCommand("IF");
*/
