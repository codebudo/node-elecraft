
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
  describe('#processCommand()', function(){
    it('should emit a "GeneralInformation" event', function(done){
      kx.on('GeneralInformation', function(e){
        done();
      });
      kx.processCommand("IF");
    });

    it('should emit a "busy" event', function(done){
      kx.on('busy', function(e){
        done();
      });
      kx.processCommand("?");
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
