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
  describe('LDX', function() {
    it('should load a byte', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xA2);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.x, 0x02);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should set the zero flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xA2);
      this.memory.writeByte(0x1001, 0x00);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.Z);
      assert.equal(this.cpu.x, 0x00);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should set the negative flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xA2);
      this.memory.writeByte(0x1001, 0x80);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.x, 0x80);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should properly handle zero page', function() {
      this.cpu.ip = 0x1000;
      this.cpu.x = 0x01;
      this.memory.writeByte(0x1000, 0xA6);
      this.memory.writeByte(0x1001, 0x40);
      this.memory.writeByte(0x40, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.x, 0x02);
    });
    it('should properly handle zero page Y', function() {
      this.cpu.ip = 0x1000;
      this.cpu.x = 0x01;
      this.cpu.y = 0xC0;
      this.memory.writeByte(0x1000, 0xB6);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x80, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.x, 0x02);
    });
    it('should properly handle absolute', function() {
      this.cpu.ip = 0x1000;
      this.cpu.x = 0x01;
      this.memory.writeByte(0x1000, 0xAE);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04C0, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.x, 0x02);
    });
    it('should properly handle absolute Y', function() {
      this.cpu.ip = 0x1000;
      this.cpu.x = 0x01;
      this.cpu.y = 0x0F;
      this.memory.writeByte(0x1000, 0xBE);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04CF, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.x, 0x02);
    });
  });
  describe('LDY', function() {
    it('should load a byte', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xA0);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.y, 0x02);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should set the zero flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xA0);
      this.memory.writeByte(0x1001, 0x00);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.Z);
      assert.equal(this.cpu.y, 0x00);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should set the negative flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xA0);
      this.memory.writeByte(0x1001, 0x80);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.y, 0x80);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should properly handle zero page', function() {
      this.cpu.ip = 0x1000;
      this.cpu.y = 0x01;
      this.memory.writeByte(0x1000, 0xA4);
      this.memory.writeByte(0x1001, 0x40);
      this.memory.writeByte(0x40, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.y, 0x02);
    });
    it('should properly handle zero page X', function() {
      this.cpu.ip = 0x1000;
      this.cpu.x = 0xC0;
      this.cpu.y = 0x01;
      this.memory.writeByte(0x1000, 0xB4);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x80, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.y, 0x02);
    });
    it('should properly handle absolute', function() {
      this.cpu.ip = 0x1000;
      this.cpu.y = 0x01;
      this.memory.writeByte(0x1000, 0xAC);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04C0, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.y, 0x02);
    });
    it('should properly handle absolute X', function() {
      this.cpu.ip = 0x1000;
      this.cpu.x = 0x0F;
      this.cpu.y = 0x01;
      this.memory.writeByte(0x1000, 0xBC);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04CF, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.y, 0x02);
    });
  });
  describe('PHA', function() {
    it('should push a', function() {
      this.cpu.ip = 0x1000;
      this.cpu.sp = 0xFF;
      this.cpu.a = 0x5A;
      this.memory.writeByte(0x1000, 0x48);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.sp, 0xFE);
      assert.equal(this.memory.readByte(0x1FF), 0x5A);
    });
    it('should throw a stack exception', function() {
      this.cpu.ip = 0x1000;
      this.cpu.sp = 0x00;
      this.cpu.a = 0x5A;
      this.memory.writeByte(0x1000, 0x48);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.isHalted(), true);
    });
  });
  describe('PHP', function() {
    it('should push flags', function() {
      this.cpu.ip = 0x1000;
      this.cpu.sp = 0xFF;
      this.cpu.flags = 0x5A;
      this.memory.writeByte(0x1000, 0x08);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.sp, 0xFE);
      assert.equal(this.memory.readByte(0x1FF), 0x5A);
    });
    it('should throw a stack exception', function() {
      this.cpu.ip = 0x1000;
      this.cpu.sp = 0x00;
      this.cpu.flags = 0x5A;
      this.memory.writeByte(0x1000, 0x08);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.isHalted(), true);
    });
  });
  describe('PLA', function() {
    it('should pull a', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.sp = 0xFE;
      this.cpu.a = 0x5A;
      this.memory.writeByte(0x1000, 0x68)
      this.memory.writeByte(0x01FF, 0x42);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.sp, 0xFF);
      assert.equal(this.cpu.a, 0x42);
    });
    it('should set the zero flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.sp = 0xFE;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x5A;
      this.memory.writeByte(0x1000, 0x68)
      this.memory.writeByte(0x01FF, 0x00);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.flags, Flags.Z);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.sp, 0xFF);
      assert.equal(this.cpu.a, 0x00);
    });
    it('should set the negative flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.sp = 0xFE;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x5A;
      this.memory.writeByte(0x1000, 0x68)
      this.memory.writeByte(0x01FF, 0x80);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.sp, 0xFF);
      assert.equal(this.cpu.a, 0x80);
    });
    it('should throw a stack exception', function() {
      this.cpu.ip = 0x1000;
      this.cpu.sp = 0xFF;
      this.cpu.a = 0x5A;
      this.memory.writeByte(0x1000, 0x68);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.isHalted(), true);
    });
  });
  describe('PLP', function() {
    it('should pull flags', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.sp = 0xFE;
      this.cpu.a = 0x5A;
      this.memory.writeByte(0x1000, 0x28)
      this.memory.writeByte(0x01FF, 0x55);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.flags, 0x55);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.sp, 0xFF);
    });
    it('should stack overflow', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.sp = 0xFF;
      this.cpu.a = 0x5A;
      this.memory.writeByte(0x1000, 0x28)
      this.memory.writeByte(0x01FF, 0x55);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.isHalted(), true);
    });
  });
  describe('STA', function() {
    it('should store in zero page', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x5A;
      this.memory.writeByte(0x1000, 0x85);
      this.memory.writeByte(0x1001, 0x80);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.memory.readByte(0x0080), 0x5A);
    });
    it('should store in zero page X', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x5A;
      this.cpu.x = 0x10;
      this.memory.writeByte(0x1000, 0x95);
      this.memory.writeByte(0x1001, 0x80);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.memory.readByte(0x0090), 0x5A);
    });
    it('should store at absolute address', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x5A;
      this.memory.writeByte(0x1000, 0x8D);
      this.memory.writeByte(0x1001, 0x34);
      this.memory.writeByte(0x1002, 0x12);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.memory.readByte(0x1234), 0x5A);
    });
    it('should store at absolute address+X', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x5A;
      this.cpu.x = 0x10;
      this.memory.writeByte(0x1000, 0x9D);
      this.memory.writeByte(0x1001, 0x24);
      this.memory.writeByte(0x1002, 0x12);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 5);
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.memory.readByte(0x1234), 0x5A);
    });
    it('should store at absolute address+Y', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x5A;
      this.cpu.y = 0x10;
      this.memory.writeByte(0x1000, 0x99);
      this.memory.writeByte(0x1001, 0x24);
      this.memory.writeByte(0x1002, 0x12);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 5);
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.memory.readByte(0x1234), 0x5A);
    });
    it('should store at indirect X', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x5A;
      this.cpu.x = 0x10;
      this.memory.writeByte(0x1000, 0x81);
      this.memory.writeByte(0x1001, 0x20);
      this.memory.writeByte(0x0030, 0x34);
      this.memory.writeByte(0x0031, 0x12);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 6);
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.memory.readByte(0x1234), 0x5A);
    });
    it('should store at indirect Y', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x5A;
      this.cpu.y = 0x10;
      this.memory.writeByte(0x1000, 0x91);
      this.memory.writeByte(0x1001, 0x20);
      this.memory.writeByte(0x0020, 0x24);
      this.memory.writeByte(0x0021, 0x12);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 6);
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.memory.readByte(0x1234), 0x5A);
    });
  });
  describe('STX', function() {
    it('should store in zero page', function() {
      this.cpu.ip = 0x1000;
      this.cpu.x = 0x5A;
      this.memory.writeByte(0x1000, 0x86);
      this.memory.writeByte(0x1001, 0x80);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.memory.readByte(0x0080), 0x5A);
    });
    it('should store in zero page Y', function() {
      this.cpu.ip = 0x1000;
      this.cpu.x = 0x5A;
      this.cpu.y = 0x10;
      this.memory.writeByte(0x1000, 0x96);
      this.memory.writeByte(0x1001, 0x70);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.memory.readByte(0x0080), 0x5A);
    });
    it('should store at absolute address', function() {
      this.cpu.ip = 0x1000;
      this.cpu.x = 0x5A;
      this.memory.writeByte(0x1000, 0x8E);
      this.memory.writeByte(0x1001, 0x34);
      this.memory.writeByte(0x1002, 0x12);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.memory.readByte(0x1234), 0x5A);
    });
  });
  describe('STY', function() {
    it('should store in zero page', function() {
      this.cpu.ip = 0x1000;
      this.cpu.y = 0x5A;
      this.memory.writeByte(0x1000, 0x84);
      this.memory.writeByte(0x1001, 0x80);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.memory.readByte(0x0080), 0x5A);
    });
    it('should store in zero page X', function() {
      this.cpu.ip = 0x1000;
      this.cpu.x = 0x10;
      this.cpu.y = 0x5A;
      this.memory.writeByte(0x1000, 0x94);
      this.memory.writeByte(0x1001, 0x70);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.memory.readByte(0x0080), 0x5A);
    });
    it('should store at absolute address', function() {
      this.cpu.ip = 0x1000;
      this.cpu.y = 0x5A;
      this.memory.writeByte(0x1000, 0x8C);
      this.memory.writeByte(0x1001, 0x34);
      this.memory.writeByte(0x1002, 0x12);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.memory.readByte(0x1234), 0x5A);
    });
  });
  describe('TAX', function() {
    it('should transfer a to x', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x5A;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xAA);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.x, 0x5A);
    });
    it('should set the zero flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x00;
      this.cpu.x = 0xFF;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xAA);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.flags, Flags.Z);
      assert.equal(this.cpu.x, 0x00);
    });
    it('should set the negative flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x80;
      this.cpu.x = 0xFF;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xAA);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.x, 0x80);
    });
  });
  describe('TAY', function() {
    it('should transfer a to y', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x5A;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xA8);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.y, 0x5A);
    });
    it('should set the zero flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x00;
      this.cpu.x = 0xFF;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xA8);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.flags, Flags.Z);
      assert.equal(this.cpu.y, 0x00);
    });
    it('should set the negative flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x80;
      this.cpu.x = 0xFF;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xA8);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.y, 0x80);
    });
  });
  describe('TSX', function() {
    it('should transfer s to x', function() {
      this.cpu.ip = 0x1000;
      this.cpu.s = 0x5A;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xBA);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.x, 0x5A);
    });
    it('should set the zero flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.s = 0x00;
      this.cpu.x = 0xFF;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xBA);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.flags, Flags.Z);
      assert.equal(this.cpu.x, 0x00);
    });
    it('should set the negative flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.s = 0x80;
      this.cpu.x = 0xFF;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xBA);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.x, 0x80);
    });
  });
});
