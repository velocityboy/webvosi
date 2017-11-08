var assert = require('assert');
var Memory = require('../out/Memory').default;
var CPU = require('../out/CPU').default;
var Flags = require('../out/CPU').Flags;

describe('CPU Logic', function() {
  describe('ASL', function() {
    it('should shift left', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x05;
      this.memory.writeByte(0x1000, 0x0A);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.a, 0x0A);
      assert.equal(this.cpu.ip, 0x1001);
    });

    it('should set carry on overflow', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x81;
      this.memory.writeByte(0x1000, 0x0A);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.C);
      assert.equal(this.cpu.a, 0x02);
      assert.equal(this.cpu.ip, 0x1001);
    });

    it('should set the zero flag on zero', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x00;
      this.memory.writeByte(0x1000, 0x0A);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.Z);
      assert.equal(this.cpu.a, 0x00);
      assert.equal(this.cpu.ip, 0x1001);
    });

    it('should set the negative flag on hi bit', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x40;
      this.memory.writeByte(0x1000, 0x0A);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.a, 0x80);
      assert.equal(this.cpu.ip, 0x1001);
    });

    it('should not touch other flags', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0xFF;
      this.cpu.a = 0x01;
      this.memory.writeByte(0x1000, 0x0A);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, 0xFF & ~(Flags.N|Flags.Z|Flags.C));
      assert.equal(this.cpu.a, 0x02);
      assert.equal(this.cpu.ip, 0x1001);
    });

    it('should work with zero page', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x01;
      this.memory.writeByte(0x80, 0x20);
      this.memory.writeByte(0x1000, 0x06);
      this.memory.writeByte(0x1001, 0x80);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 5);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.a, 0x01);
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.memory.readByte(0x80), 0x40);
    });

    it('should work with zero page X', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x01;
      this.cpu.x = 0x10;
      this.memory.writeByte(0x90, 0x20);
      this.memory.writeByte(0x1000, 0x16);
      this.memory.writeByte(0x1001, 0x80);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 6);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.a, 0x01);
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.memory.readByte(0x90), 0x40);
    });

    it('should work with absolute', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x01;
      this.memory.writeByte(0x1234, 0x20);
      this.memory.writeByte(0x1000, 0x0E);
      this.memory.writeByte(0x1001, 0x34);
      this.memory.writeByte(0x1002, 0x12);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 6);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.a, 0x01);
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.memory.readByte(0x1234), 0x40);
    });

    it('should work with absolute X', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x01;
      this.cpu.x = 0x10;
      this.memory.writeByte(0x1244, 0x20);
      this.memory.writeByte(0x1000, 0x1E);
      this.memory.writeByte(0x1001, 0x34);
      this.memory.writeByte(0x1002, 0x12);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 7);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.a, 0x01);
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.memory.readByte(0x1244), 0x40);
    });
  });
  describe('AND', function() {
    it('should perform and', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x60;
      this.memory.writeByte(0x1000, 0x29);
      this.memory.writeByte(0x1001, 0xC0);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.a, 0x40);
      assert.equal(this.cpu.ip, 0x1002);
    });

    it('should properly set Z flag', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0xF0;
      this.memory.writeByte(0x1000, 0x29);
      this.memory.writeByte(0x1001, 0x0F);

      this.cpu.step();
      assert.equal(this.cpu.flags, Flags.Z);
      assert.equal(this.cpu.a, 0x00);
    });

    it('should properly set N flag', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0xC0;
      this.memory.writeByte(0x1000, 0x29);
      this.memory.writeByte(0x1001, 0x81);

      this.cpu.step();
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.a, 0x80);
    });

    it('should not disturb other flags', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0xFF;
      this.cpu.a = 0x01;
      this.memory.writeByte(0x1000, 0x29);
      this.memory.writeByte(0x1001, 0x41);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.flags, 0xFF & ~(Flags.Z|Flags.N));
      assert.equal(this.cpu.a, 0x01);
    });

    it('should properly handle zero page', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.a = 0xC0;
      this.memory.writeByte(0x1000, 0x25);
      this.memory.writeByte(0x1001, 0x40);
      this.memory.writeByte(0x40, 0x60);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.a, 0x40);
    });

    it('should properly handle zero page X', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x30;
      this.cpu.x = 0xC0;
      this.memory.writeByte(0x1000, 0x35);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x80, 0x60);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.a, 0x20);
    });

    it('should properly handle absolute', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.a = 0xC0;
      this.memory.writeByte(0x1000, 0x2D);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04C0, 0x60);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.a, 0x40);
    });

    it('should properly handle absolute X', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.a = 0xC0;
      this.cpu.x = 0x0F;
      this.memory.writeByte(0x1000, 0x3D);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04CF, 0x60);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.a, 0x40);
    });

    it('should properly handle absolute Y', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.a = 0xC0;
      this.cpu.y = 0x0E;
      this.memory.writeByte(0x1000, 0x39);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04CE, 0x60);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.a, 0x40);
    });

    it('should properly handle indirect X', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.a = 0xC0;
      this.cpu.x = 0x20;
      this.memory.writeByte(0x1000, 0x21);
      this.memory.writeByte(0x1001, 0xF0);
      this.memory.writeByte(0x0010, 0x34);
      this.memory.writeByte(0x0011, 0x12);
      this.memory.writeByte(0x1234, 0x60);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 6);
      assert.equal(this.cpu.a, 0x40);
    });

    it('should properly handle indirect Y', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.a = 0xC0;
      this.cpu.y = 0x20;
      this.memory.writeByte(0x1000, 0x31);
      this.memory.writeByte(0x1001, 0xF0);
      this.memory.writeByte(0x00F0, 0x98);
      this.memory.writeByte(0x00F1, 0x0C);
      this.memory.writeByte(0x0CB8, 0x60);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 5);
      assert.equal(this.cpu.a, 0x40);
    });
  });

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
    });

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
    });

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
    });

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
    });

    it('should use immediate mode', function() {
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
    });

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
    });

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
    });

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
    });

    it('should properly handle absolute X', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.cpu.x = 0x0F;
      this.memory.writeByte(0x1000, 0x1D);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04CF, 0x70);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.a, 0x71);
    });

    it('should properly handle absolute Y', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.cpu.y = 0x0E;
      this.memory.writeByte(0x1000, 0x19);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04CE, 0x70);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.a, 0x71);
    });

    it('should properly handle indirect X', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.cpu.x = 0x20;
      this.memory.writeByte(0x1000, 0x01);
      this.memory.writeByte(0x1001, 0xF0);
      this.memory.writeByte(0x0010, 0x34);
      this.memory.writeByte(0x0011, 0x12);
      this.memory.writeByte(0x1234, 0x70);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 6);
      assert.equal(this.cpu.a, 0x71);
    });

    it('should properly handle indirect Y', function() {
      this.cpu.sp = 0xFF;
      this.cpu.ip = 0x1000;
      this.cpu.a = 0x01;
      this.cpu.y = 0x20;
      this.memory.writeByte(0x1000, 0x11);
      this.memory.writeByte(0x1001, 0xF0);
      this.memory.writeByte(0x00F0, 0x98);
      this.memory.writeByte(0x00F1, 0x0C);
      this.memory.writeByte(0x0CB8, 0x70);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 5);
      assert.equal(this.cpu.a, 0x71);
    });
  });
});
