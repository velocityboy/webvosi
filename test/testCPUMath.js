var assert = require('assert');
var Memory = require('../out/Memory').default;
var CPU = require('../out/CPU').default;
var Flags = require('../out/CPU').Flags;

describe('CPU Math', function() {
  describe('ADC', function() {
    it('should add', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x05;
      this.memory.writeByte(0x1000, 0x69);
      this.memory.writeByte(0x1001, 0x0A);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.a, 0x0F);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should add with carry', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = Flags.C;
      this.cpu.a = 0x05;
      this.memory.writeByte(0x1000, 0x69);
      this.memory.writeByte(0x1001, 0x0A);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.a, 0x10);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should carry out', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0xFF;
      this.memory.writeByte(0x1000, 0x69);
      this.memory.writeByte(0x1001, 0xFF);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.C | Flags.N);
      assert.equal(this.cpu.a, 0xFE);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should overflow', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x40;
      this.memory.writeByte(0x1000, 0x69);
      this.memory.writeByte(0x1001, 0x40);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.a, 0x80);
      assert.equal(this.cpu.flags, Flags.N | Flags.V);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should set the zero flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x01;
      this.memory.writeByte(0x1000, 0x69);
      this.memory.writeByte(0x1001, 0xFF);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.a, 0x00);
      assert.equal(this.cpu.flags, Flags.Z | Flags.C);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should properly handle zero page', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.memory.writeByte(0x1000, 0x65);
      this.memory.writeByte(0x1001, 0x40);
      this.memory.writeByte(0x40, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.a, 0x03);
    });
    it('should properly handle zero page X', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.cpu.x = 0xC0;
      this.memory.writeByte(0x1000, 0x75);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x80, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.a, 0x03);
    });
    it('should properly handle absolute', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.memory.writeByte(0x1000, 0x6D);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04C0, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.a, 0x03);
    });

    it('should properly handle absolute X', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.cpu.x = 0x0F;
      this.memory.writeByte(0x1000, 0x7D);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04CF, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.a, 0x03);
    });
    it('should properly handle absolute Y', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.cpu.y = 0x0E;
      this.memory.writeByte(0x1000, 0x79);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04CE, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.a, 0x03);
    });
    it('should properly handle indirect X', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.cpu.x = 0x20;
      this.memory.writeByte(0x1000, 0x61);
      this.memory.writeByte(0x1001, 0xF0);
      this.memory.writeByte(0x0010, 0x34);
      this.memory.writeByte(0x0011, 0x12);
      this.memory.writeByte(0x1234, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 6);
      assert.equal(this.cpu.a, 0x03);
    });
    it('should properly handle indirect Y', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.cpu.y = 0x20;
      this.memory.writeByte(0x1000, 0x71);
      this.memory.writeByte(0x1001, 0xF0);
      this.memory.writeByte(0x00F0, 0x98);
      this.memory.writeByte(0x00F1, 0x0C);
      this.memory.writeByte(0x0CB8, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 5);
      assert.equal(this.cpu.a, 0x03);
    });
  });
  describe('CLC', function() {
    it('should clear carry', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = Flags.C;
      this.memory.writeByte(0x1000, 0x18);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.ip, 0x1001);
    });
  });
  describe('CLD', function() {
    it('should clear decimal flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = Flags.D;
      this.memory.writeByte(0x1000, 0xD8);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.ip, 0x1001);
    });
  });
  describe('CLI', function() {
    it('should clear interrupt disable flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = Flags.DI;
      this.memory.writeByte(0x1000, 0x58);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.ip, 0x1001);
    });
  });
});
