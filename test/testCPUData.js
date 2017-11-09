var assert = require('assert');
var Memory = require('../out/Memory').default;
var CPU = require('../out/CPU').default;
var Flags = require('../out/CPU').Flags;

describe('CPU Data Moves', function() {
  describe('LDA', function() {
    it('should load a byte', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xA9);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.a, 0x02);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should set the zero flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xA9);
      this.memory.writeByte(0x1001, 0x00);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.Z);
      assert.equal(this.cpu.a, 0x00);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should set the negative flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xA9);
      this.memory.writeByte(0x1001, 0x80);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.a, 0x80);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should properly handle zero page', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.memory.writeByte(0x1000, 0xA5);
      this.memory.writeByte(0x1001, 0x40);
      this.memory.writeByte(0x40, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.a, 0x02);
    });
    it('should properly handle zero page X', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.cpu.x = 0xC0;
      this.memory.writeByte(0x1000, 0xB5);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x80, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.a, 0x02);
    });
    it('should properly handle absolute', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.memory.writeByte(0x1000, 0xAD);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04C0, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.a, 0x02);
    });
    it('should properly handle absolute X', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.cpu.x = 0x0F;
      this.memory.writeByte(0x1000, 0xBD);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04CF, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.a, 0x02);
    });
    it('should properly handle absolute Y', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.cpu.y = 0x0E;
      this.memory.writeByte(0x1000, 0xB9);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04CE, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.a, 0x02);
    });
    it('should properly handle indirect X', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.cpu.x = 0x20;
      this.memory.writeByte(0x1000, 0xA1);
      this.memory.writeByte(0x1001, 0xF0);
      this.memory.writeByte(0x0010, 0x34);
      this.memory.writeByte(0x0011, 0x12);
      this.memory.writeByte(0x1234, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 6);
      assert.equal(this.cpu.a, 0x02);
    });
    it('should properly handle indirect Y', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.cpu.y = 0x20;
      this.memory.writeByte(0x1000, 0xB1);
      this.memory.writeByte(0x1001, 0xF0);
      this.memory.writeByte(0x00F0, 0x98);
      this.memory.writeByte(0x00F1, 0x0C);
      this.memory.writeByte(0x0CB8, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 5);
      assert.equal(this.cpu.a, 0x02);
    });
  });
});
