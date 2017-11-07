var assert = require('assert');
var Memory = require('../out/Memory').default;

describe('Memory', function() {
  describe('#readByte', function() {
    it('should read back uninitialized memory as zero', function() {
      assert.equal(this.memory.readByte(0), 0)
    })
    it('should read back what was written', function() {
      this.memory.writeByte(0x1000, 42);
      assert.equal(this.memory.readByte(0x1000), 42);
    })
    it ('should read back initialized memory', function() {
      let data = new Uint8Array([1,2,3]);
      this.memory.initializeRegion(data, 0x1000);
      assert.equal(this.memory.readByte(0x1000), 1);
      assert.equal(this.memory.readByte(0x1001), 2);
      assert.equal(this.memory.readByte(0x1002), 3);
    })
  })
})
