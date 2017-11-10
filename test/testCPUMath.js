var assert = require('assert');
var Memory = require('../out/Memory').default;
var CPU = require('../out/CPU').default;
var Flags = require('../out/CPU').Flags;

describe('CPU Math', function() {
  describe('ADC', function() {
    describe('unsigned', function() {
      it('C=0 1+1 = 2, C=0, Z=0, N=0, V=0', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = 0x00;
        this.cpu.a = 1;
        this.memory.writeByte(0x1000, 0x69);
        this.memory.writeByte(0x1001, 1);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 2);
        assert.equal(this.cpu.flags, 0x00);
        assert.equal(this.cpu.a, 2);
        assert.equal(this.cpu.ip, 0x1002);
      });
      it('C=1 1+1 = 3, C=0, Z=0, N=0, V=0', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = Flags.C;
        this.cpu.a = 1;
        this.memory.writeByte(0x1000, 0x69);
        this.memory.writeByte(0x1001, 1);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 2);
        assert.equal(this.cpu.flags, 0x00);
        assert.equal(this.cpu.a, 3);
        assert.equal(this.cpu.ip, 0x1002);
      });
      it('C=0 0+0 = 0, C=0, Z=1, N=0, V=0', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = 0x00;
        this.cpu.a = 0;
        this.memory.writeByte(0x1000, 0x69);
        this.memory.writeByte(0x1001, 0);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 2);
        assert.equal(this.cpu.flags, Flags.Z);
        assert.equal(this.cpu.a, 0);
        assert.equal(this.cpu.ip, 0x1002);
      });
      it('C=0 254+254 = 508 = 252, C=1, Z=0, N=1, V=0', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = 0x00;
        this.cpu.a = 254;
        this.memory.writeByte(0x1000, 0x69);
        this.memory.writeByte(0x1001, 254);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 2);
        assert.equal(this.cpu.a, 252);
        assert.equal(this.cpu.flags, Flags.N | Flags.C);
        assert.equal(this.cpu.ip, 0x1002);
      });
    });
    describe('signed', function() {
      it('C=0 1+-1 = 0, C=1, Z=1, N=0, V=0', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = 0x00;
        this.cpu.a = 1;
        this.memory.writeByte(0x1000, 0x69);
        this.memory.writeByte(0x1001,-1 & 0xFF);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 2);
        assert.equal(this.cpu.a, 0);
        assert.equal(this.cpu.flags, Flags.Z | Flags.C);
        assert.equal(this.cpu.ip, 0x1002);
      });
      it('C=0 1+-3 = -2, C=0, Z=0, N=1, V=0', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = 0x00;
        this.cpu.a = 1;
        this.memory.writeByte(0x1000, 0x69);
        this.memory.writeByte(0x1001, -3 & 0xFF);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 2);
        assert.equal(this.cpu.a, -2 & 0xFF);
        assert.equal(this.cpu.flags, Flags.N);
        assert.equal(this.cpu.ip, 0x1002);
      });
      it('C=0 96+96 = -64, C=0, Z=0, N=1, V=1', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = 0x00;
        this.cpu.a = 96;
        this.memory.writeByte(0x1000, 0x69);
        this.memory.writeByte(0x1001, 96);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 2);
        assert.equal(this.cpu.a, -64 & 0xFF);
        assert.equal(this.cpu.flags, Flags.N | Flags.V);
        assert.equal(this.cpu.ip, 0x1002);
      });
      it('C=1 127+0 = -128, C=0, Z=0, N=1, V=1', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = Flags.C;
        this.cpu.a = 127;
        this.memory.writeByte(0x1000, 0x69);
        this.memory.writeByte(0x1001, 0);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 2);
        assert.equal(this.cpu.a, -128 & 0xFF);
        assert.equal(this.cpu.flags, Flags.N | Flags.V);
        assert.equal(this.cpu.ip, 0x1002);
      });
    });
    describe('addressing modes', function() {
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
  describe('CLV', function() {
    it('should clear overflow flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = Flags.V;
      this.memory.writeByte(0x1000, 0xB8);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.ip, 0x1001);
    });
  });
  describe('CMP', function() {
    it('should set the negative flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 2;
      this.memory.writeByte(0x1000, 0xC9);
      this.memory.writeByte(0x1001, 0x03);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should set the carry flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x81;
      this.memory.writeByte(0x1000, 0xC9);
      this.memory.writeByte(0x1001, 0x80);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.C);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should set the zero flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 2;
      this.memory.writeByte(0x1000, 0xC9);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.Z | Flags.C);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should properly handle zero page', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x02;
      this.memory.writeByte(0x1000, 0xC5);
      this.memory.writeByte(0x1001, 0x40);
      this.memory.writeByte(0x40, 0x03);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.a, 0x02);
    });
    it('should properly handle zero page X', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x02;
      this.cpu.x = 0xC0;
      this.memory.writeByte(0x1000, 0xD5);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x80, 0x03);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.a, 0x02);
    });
    it('should properly handle absolute', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x02;
      this.memory.writeByte(0x1000, 0xCD);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04C0, 0x03);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.a, 0x02);
    });

    it('should properly handle absolute X', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x02;
      this.cpu.x = 0x0F;
      this.memory.writeByte(0x1000, 0xDD);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04CF, 0x03);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.a, 0x02);
    });
    it('should properly handle absolute Y', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x02;
      this.cpu.y = 0x0E;
      this.memory.writeByte(0x1000, 0xD9);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04CE, 0x03);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.a, 0x02);
    });
    it('should properly handle indirect X', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x02;
      this.cpu.x = 0x20;
      this.memory.writeByte(0x1000, 0xC1);
      this.memory.writeByte(0x1001, 0xF0);
      this.memory.writeByte(0x0010, 0x34);
      this.memory.writeByte(0x0011, 0x12);
      this.memory.writeByte(0x1234, 0x03);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 6);
      assert.equal(this.cpu.a, 0x02);
    });
    it('should properly handle indirect Y', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.a = 0x02;
      this.cpu.y = 0x20;
      this.memory.writeByte(0x1000, 0xD1);
      this.memory.writeByte(0x1001, 0xF0);
      this.memory.writeByte(0x00F0, 0x98);
      this.memory.writeByte(0x00F1, 0x0C);
      this.memory.writeByte(0x0CB8, 0x03);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.cycles() - startCycles, 5);
      assert.equal(this.cpu.a, 0x02);
    });
  });
  describe('CPX', function() {
    it('should set the negative flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.x = 2;
      this.memory.writeByte(0x1000, 0xE0);
      this.memory.writeByte(0x1001, 0x03);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should set the carry flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.x = 0x81;
      this.memory.writeByte(0x1000, 0xE0);
      this.memory.writeByte(0x1001, 0x80);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.C);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should set the zero flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.x = 2;
      this.memory.writeByte(0x1000, 0xE0);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.Z | Flags.C);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should properly handle zero page', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.x = 0x02;
      this.memory.writeByte(0x1000, 0xE4);
      this.memory.writeByte(0x1001, 0x40);
      this.memory.writeByte(0x40, 0x03);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.x, 0x02);
    });
    it('should properly handle absolute', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.x = 0x02;
      this.memory.writeByte(0x1000, 0xEC);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04C0, 0x03);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.x, 0x02);
    });
  });
  describe('CPY', function() {
    it('should set the negative flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.y = 2;
      this.memory.writeByte(0x1000, 0xC0);
      this.memory.writeByte(0x1001, 0x03);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should set the carry flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.y = 0x81;
      this.memory.writeByte(0x1000, 0xC0);
      this.memory.writeByte(0x1001, 0x80);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.C);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should set the zero flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.y = 2;
      this.memory.writeByte(0x1000, 0xC0);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.Z | Flags.C);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should properly handle zero page', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.y = 0x02;
      this.memory.writeByte(0x1000, 0xC4);
      this.memory.writeByte(0x1001, 0x40);
      this.memory.writeByte(0x40, 0x03);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.y, 0x02);
    });
    it('should properly handle absolute', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.y = 0x02;
      this.memory.writeByte(0x1000, 0xCC);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04C0, 0x03);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.cycles() - startCycles, 4);
      assert.equal(this.cpu.y, 0x02);
    });
  });
  describe('DEC', function() {
    it('should decrement', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xC6);
      this.memory.writeByte(0x1001, 0x03);
      this.memory.writeByte(0x03, 0x03);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 5);
      assert.equal(this.cpu.flags, 0);
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.memory.readByte(0x03), 0x02);
    });
    it('should set the zero flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xC6);
      this.memory.writeByte(0x1001, 0x03);
      this.memory.writeByte(0x03, 0x01);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 5);
      assert.equal(this.cpu.flags, Flags.Z);
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.memory.readByte(0x03), 0x00);
    });
    it('should set the negative flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xC6);
      this.memory.writeByte(0x1001, 0x03);
      this.memory.writeByte(0x03, 0x00);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 5);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.memory.readByte(0x03), 0xFF);
    });
    it('should properly handle zero page X', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.x = 0xC0;
      this.memory.writeByte(0x1000, 0xD6);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x80, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 6);
      assert.equal(this.memory.readByte(0x80), 0x01);
    });
    it('should properly handle absolute', function() {
      this.cpu.ip = 0x1000;
      this.memory.writeByte(0x1000, 0xCE);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04C0, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.cycles() - startCycles, 6);
      assert.equal(this.memory.readByte(0x04C0), 0x01);
    });
    it('should properly handle absolute X', function() {
      this.cpu.ip = 0x1000;
      this.cpu.x = 0x0F;
      this.memory.writeByte(0x1000, 0xDE);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04CF, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.cycles() - startCycles, 7);
      assert.equal(this.memory.readByte(0x04CF), 0x01);
    });
  });
  describe('DEX', function() {
    it('should decrement', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.x = 0x03;
      this.memory.writeByte(0x1000, 0xCA);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, 0);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.x, 0x02);
    });
    it('should set the zero flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.x = 0x01;
      this.memory.writeByte(0x1000, 0xCA);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.Z);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.x, 0x00);
    });
    it('should set the negative flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.x = 0x00;
      this.memory.writeByte(0x1000, 0xCA);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.x, 0xFF);
    });
  });
  describe('DEY', function() {
    it('should decrement', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.y = 0x03;
      this.memory.writeByte(0x1000, 0x88);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, 0);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.y, 0x02);
    });
    it('should set the zero flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.y = 0x01;
      this.memory.writeByte(0x1000, 0x88);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.Z);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.y, 0x00);
    });
    it('should set the negative flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.y = 0x00;
      this.memory.writeByte(0x1000, 0x88);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.y, 0xFF);
    });
  });
  describe('INC', function() {
    it('should increment', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xE6);
      this.memory.writeByte(0x1001, 0x03);
      this.memory.writeByte(0x03, 0x03);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 5);
      assert.equal(this.cpu.flags, 0);
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.memory.readByte(0x03), 0x04);
    });
    it('should set the zero flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xE6);
      this.memory.writeByte(0x1001, 0x03);
      this.memory.writeByte(0x03, 0xFF);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 5);
      assert.equal(this.cpu.flags, Flags.Z);
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.memory.readByte(0x03), 0x00);
    });
    it('should set the negative flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xE6);
      this.memory.writeByte(0x1001, 0x03);
      this.memory.writeByte(0x03, 0xFE);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 5);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.memory.readByte(0x03), 0xFF);
    });
    it('should properly handle zero page X', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.x = 0xC0;
      this.memory.writeByte(0x1000, 0xF6);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x80, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1002);
      assert.equal(this.cpu.cycles() - startCycles, 6);
      assert.equal(this.memory.readByte(0x80), 0x03);
    });
    it('should properly handle absolute', function() {
      this.cpu.ip = 0x1000;
      this.memory.writeByte(0x1000, 0xEE);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04C0, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.cycles() - startCycles, 6);
      assert.equal(this.memory.readByte(0x04C0), 0x03);
    });
    it('should properly handle absolute X', function() {
      this.cpu.ip = 0x1000;
      this.cpu.x = 0x0F;
      this.memory.writeByte(0x1000, 0xFE);
      this.memory.writeByte(0x1001, 0xC0);
      this.memory.writeByte(0x1002, 0x04);
      this.memory.writeByte(0x04CF, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.ip, 0x1003);
      assert.equal(this.cpu.cycles() - startCycles, 7);
      assert.equal(this.memory.readByte(0x04CF), 0x03);
    });
  });
  describe('INX', function() {
    it('should increment', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.x = 0x03;
      this.memory.writeByte(0x1000, 0xE8);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, 0);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.x, 0x04);
    });
    it('should set the zero flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.x = 0xFF;
      this.memory.writeByte(0x1000, 0xE8);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.Z);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.x, 0x00);
    });
    it('should set the negative flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.x = 0xFE;
      this.memory.writeByte(0x1000, 0xE8);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.x, 0xFF);
    });
  });
  describe('INY', function() {
    it('should increment', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.y = 0x03;
      this.memory.writeByte(0x1000, 0xC8);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, 0);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.y, 0x04);
    });
    it('should set the zero flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.y = 0xFF;
      this.memory.writeByte(0x1000, 0xC8);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.Z);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.y, 0x00);
    });
    it('should set the negative flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.cpu.y = 0xFE;
      this.memory.writeByte(0x1000, 0xC8);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.N);
      assert.equal(this.cpu.ip, 0x1001);
      assert.equal(this.cpu.y, 0xFF);
    });
  });
  describe('SBC', function() {
    describe('unsigned', function() {
      it('C=1 2-1 => 1, C=1, Z=0, N=0, V=0', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = Flags.C;
        this.cpu.a = 2;
        this.memory.writeByte(0x1000, 0xE9);
        this.memory.writeByte(0x1001, 1);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 2);
        assert.equal(this.cpu.flags, Flags.C);
        assert.equal(this.cpu.a, 1);
        assert.equal(this.cpu.ip, 0x1002);
      });
      it('C=1 254-253 => 1, C=1, Z=0, N=0, V=0', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = Flags.C;
        this.cpu.a = 254;
        this.memory.writeByte(0x1000, 0xE9);
        this.memory.writeByte(0x1001, 253);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 2);
        assert.equal(this.cpu.flags, Flags.C);
        assert.equal(this.cpu.a, 1);
        assert.equal(this.cpu.ip, 0x1002);
      });
      it('C=1 1-1 => 0, C=1, Z=1, N=0, V=0', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = Flags.C;
        this.cpu.a = 1;
        this.memory.writeByte(0x1000, 0xE9);
        this.memory.writeByte(0x1001, 1);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 2);
        assert.equal(this.cpu.flags, Flags.C | Flags.Z);
        assert.equal(this.cpu.a, 0);
        assert.equal(this.cpu.ip, 0x1002);
      });
    });
    describe('signed', function() {
      it('C=1 1-2 => -1, C=0, Z=0, N=1, V=0', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = Flags.C;
        this.cpu.a = 1;
        this.memory.writeByte(0x1000, 0xE9);
        this.memory.writeByte(0x1001, 2);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 2);
        assert.equal(this.cpu.flags, Flags.N);
        assert.equal(this.cpu.a, -1 & 0xFF);
        assert.equal(this.cpu.ip, 0x1002);
      });
      it('C=1 -1- -2 => 1, C=1, Z=0, N=0, V=0', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = Flags.C;
        this.cpu.a = -1 & 0xFF;
        this.memory.writeByte(0x1000, 0xE9);
        this.memory.writeByte(0x1001, -2 & 0xFF);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 2);
        assert.equal(this.cpu.flags, Flags.C);
        assert.equal(this.cpu.a, 1);
        assert.equal(this.cpu.ip, 0x1002);
      });
      it('C=0 -1- -2 => 0, C=1, Z=1, N=0, V=0', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = 0x00;
        this.cpu.a = -1 & 0xFF;
        this.memory.writeByte(0x1000, 0xE9);
        this.memory.writeByte(0x1001, -2 & 0xFF);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 2);
        assert.equal(this.cpu.flags, Flags.C | Flags.Z);
        assert.equal(this.cpu.a, 0);
        assert.equal(this.cpu.ip, 0x1002);
      });
      it('C=1 127 - -127 => -2, C=0, Z=0, N=1, V=1', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = Flags.C;
        this.cpu.a = 127;
        this.memory.writeByte(0x1000, 0xE9);
        this.memory.writeByte(0x1001, -127 & 0xFF);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 2);
        assert.equal(this.cpu.flags, Flags.V | Flags.N);
        assert.equal(this.cpu.a, -2 & 0xFF);
        assert.equal(this.cpu.ip, 0x1002);
      });
    });
    describe('Addressing modes', function() {
      it('should work with zero page', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = Flags.C;
        this.cpu.a = 2;
        this.memory.writeByte(0x1000, 0xE5);
        this.memory.writeByte(0x1001, 0x80);
        this.memory.writeByte(0x0080, 1);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 3);
        assert.equal(this.cpu.flags, Flags.C);
        assert.equal(this.cpu.a, 1);
        assert.equal(this.cpu.ip, 0x1002);
      });
      it('should work with zero page X', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = Flags.C;
        this.cpu.x = 0xC0;
        this.cpu.a = 2;
        this.memory.writeByte(0x1000, 0xF5);
        this.memory.writeByte(0x1001, 0xC0);
        this.memory.writeByte(0x0080, 1);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 4);
        assert.equal(this.cpu.flags, Flags.C);
        assert.equal(this.cpu.a, 1);
        assert.equal(this.cpu.ip, 0x1002);
      });
      it('should work with absolute', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = Flags.C;
        this.cpu.a = 2;
        this.memory.writeByte(0x1000, 0xED);
        this.memory.writeByte(0x1001, 0x34);
        this.memory.writeByte(0x1002, 0x12);
        this.memory.writeByte(0x1234, 1);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 4);
        assert.equal(this.cpu.flags, Flags.C);
        assert.equal(this.cpu.a, 1);
        assert.equal(this.cpu.ip, 0x1003);
      });
      it('should work with absolute X', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = Flags.C;
        this.cpu.x = 0x10;
        this.cpu.a = 2;
        this.memory.writeByte(0x1000, 0xFD);
        this.memory.writeByte(0x1001, 0x24);
        this.memory.writeByte(0x1002, 0x12);
        this.memory.writeByte(0x1234, 1);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 4);
        assert.equal(this.cpu.flags, Flags.C);
        assert.equal(this.cpu.a, 1);
        assert.equal(this.cpu.ip, 0x1003);
      });
      it('should work with absolute Y', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = Flags.C;
        this.cpu.y = 0x10;
        this.cpu.a = 2;
        this.memory.writeByte(0x1000, 0xF9);
        this.memory.writeByte(0x1001, 0x24);
        this.memory.writeByte(0x1002, 0x12);
        this.memory.writeByte(0x1234, 1);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 4);
        assert.equal(this.cpu.flags, Flags.C);
        assert.equal(this.cpu.a, 1);
        assert.equal(this.cpu.ip, 0x1003);
      });
      it('should work with indirect X', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = Flags.C;
        this.cpu.x = 0x10;
        this.cpu.a = 2;
        this.memory.writeByte(0x1000, 0xE1);
        this.memory.writeByte(0x1001, 0x20);
        this.memory.writeByte(0x0030, 0x34);
        this.memory.writeByte(0x0031, 0x12);
        this.memory.writeByte(0x1234, 1);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 6);
        assert.equal(this.cpu.flags, Flags.C);
        assert.equal(this.cpu.a, 1);
        assert.equal(this.cpu.ip, 0x1002);
      });
      it('should work with indirect Y', function() {
        this.cpu.ip = 0x1000;
        this.cpu.flags = Flags.C;
        this.cpu.y = 0x10;
        this.cpu.a = 2;
        this.memory.writeByte(0x1000, 0xF1);
        this.memory.writeByte(0x1001, 0x20);
        this.memory.writeByte(0x0020, 0x24);
        this.memory.writeByte(0x0021, 0x12);
        this.memory.writeByte(0x1234, 1);

        const startCycles = this.cpu.cycles();
        this.cpu.step();
        assert.equal(this.cpu.cycles() - startCycles, 5);
        assert.equal(this.cpu.flags, Flags.C);
        assert.equal(this.cpu.a, 1);
        assert.equal(this.cpu.ip, 0x1002);
      });
    });
  });
  describe('SEC', function() {
    it('should set carry', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0x38);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.C);
      assert.equal(this.cpu.ip, 0x1001);
    });
  });
  describe('SED', function() {
    it('should set decimal flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xF8);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.D);
      assert.equal(this.cpu.ip, 0x1001);
    });
  });
  describe('SEI', function() {
    it('should set interrupt disable flag', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0x78);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.flags, Flags.DI);
      assert.equal(this.cpu.ip, 0x1001);
    });
  });
});
