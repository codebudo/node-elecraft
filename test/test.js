
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
  describe('#processCommand("BR")', function(){
    it('should emit a "baudRate" event', function(done){
      kx.on('baudRate', function(e){
        done();
      });
      kx.processCommand('BR');
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
  describe('#processCommand("DL")', function(){
    it('should emit a "dspCommandTrace" event', function(done){
      kx.on('dspCommandTrace', function(e){
        done();
      });
      kx.processCommand('DL');
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
  describe('#processCommand("DT")', function(){
    it('should emit a "dataMode" event', function(done){
      kx.on('dataMode', function(e){
        done();
      });
      kx.processCommand('DT');
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
  /* Deprecated. Use 'BW'.
  describe('#processCommand("FW$")', function(){
    it('should emit a "filterBandwidthVFOB" event', function(done){
      kx.on('filterBandwidthVFOB', function(e){
        done();
      });
      kx.processCommand('FW$');
    });
  });
  */
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
  describe('#processCommand("MD")', function(){
    it('should emit a "operatingModeVFOA" event', function(done){
      kx.on('operatingModeVFOA', function(e){
        done();
      });
      kx.processCommand('MD');
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
});


//kx.connect();
/*
kx.on('GeneralInformation', function(e){
  console.log( e );
});
kx.processCommand("IF");
*/
