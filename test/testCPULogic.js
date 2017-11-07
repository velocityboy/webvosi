var assert = require('assert');
var Memory = require('../out/Memory').default;
var CPU = require('../out/CPU').default;
var Flags = require('../out/CPU').Flags;

describe('CPU Logic', function() {
  describe('ORA', function() {
    it('should perform or', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x60;
      this.memory.writeByte(0x1000, 0x09);
      this.memory.writeByte(0x1001, 0x01);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.a, 0x61);
      assert.equal(this.cpu.ip, 0x1002);
    })

    it('should properly set Z flag', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x00;
      this.memory.writeByte(0x1000, 0x09);
      this.memory.writeByte(0x1001, 0x00);

      this.cpu.step();
      assert.equal(this.cpu.flags, Flags.Z);
      assert.equal(this.cpu.a, 0x00);
    })

    it('should properly set N flag', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x01;
      this.memory.writeByte(0x1000, 0x09);
      this.memory.writeByte(0x1001, 0x80);

      this.cpu.step();
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.a, 0x81);
    })

    it('should not disturb other flags', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0xFF;
      this.cpu.a = 0x01;
      this.memory.writeByte(0x1000, 0x09);
      this.memory.writeByte(0x1001, 0x40);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.flags, 0xFF & ~(Flags.Z|Flags.N));
      assert.equal(this.cpu.a, 0x41);
    })

    it('should properly handle zero page', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.memory.writeByte(0x1000, 0x05);
      this.memory.writeByte(0x1001, 0x40);
      this.memory.writeByte(0x40, 0x60);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.a, 0x61);
    })

    it('should properly handle zero page X', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.cpu.x = 0xC0;
      this.memory.writeByte(0x1000, 0x15);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x80, 0x60);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.a, 0x61);
    })

    it('should properly handle absolute', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.memory.writeByte(0x1000, 0x0D);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04C0, 0x60);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.a, 0x61);
    })
  })
})
