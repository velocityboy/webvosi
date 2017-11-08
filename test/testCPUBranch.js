var assert = require('assert');
var Memory = require('../out/Memory').default;
var CPU = require('../out/CPU').default;
var Flags = require('../out/CPU').Flags;

describe('CPU Branching', function() {
  describe('BCC', function() {
    it('should not branch', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = Flags.C;
      this.memory.writeByte(0x1000, 0x90);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should branch forwards', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0x90);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x1004);
    });
    it('should branch backwards', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0x90);
      this.memory.writeByte(0x1001, 0xFD);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x0FFF);
    });
  });
  describe('BCS', function() {
    it('should not branch', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xB0);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should branch forwards', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = Flags.C;
      this.memory.writeByte(0x1000, 0xB0);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x1004);
    });
    it('should branch backwards', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = Flags.C;
      this.memory.writeByte(0x1000, 0xB0);
      this.memory.writeByte(0x1001, 0xFD);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x0FFF);
    });
  });
  describe('BEQ', function() {
    it('should not branch', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xF0);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should branch forwards', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = Flags.Z;
      this.memory.writeByte(0x1000, 0xF0);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x1004);
    });
    it('should branch backwards', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = Flags.Z;
      this.memory.writeByte(0x1000, 0xF0);
      this.memory.writeByte(0x1001, 0xFD);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x0FFF);
    });
  });
  describe('BMI', function() {
    it('should not branch', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0x30);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should branch forwards', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = Flags.N;
      this.memory.writeByte(0x1000, 0x30);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x1004);
    });
    it('should branch backwards', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = Flags.N;
      this.memory.writeByte(0x1000, 0x30);
      this.memory.writeByte(0x1001, 0xFD);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x0FFF);
    });
  });
  describe('BNE', function() {
    it('should not branch', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = Flags.Z;
      this.memory.writeByte(0x1000, 0xD0);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should branch forwards', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xD0);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x1004);
    });
    it('should branch backwards', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0xD0);
      this.memory.writeByte(0x1001, 0xFD);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x0FFF);
    });
  });
  describe('BPL', function() {
    it('should not branch', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = Flags.N;
      this.memory.writeByte(0x1000, 0x10);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should branch forwards', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0x10);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x1004);
    });
    it('should branch backwards', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0x10);
      this.memory.writeByte(0x1001, 0xFD);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x0FFF);
    });
  });
  describe('BVC', function() {
    it('should not branch', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = Flags.V;
      this.memory.writeByte(0x1000, 0x50);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should branch forwards', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0x50);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x1004);
    });
    it('should branch backwards', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0x50);
      this.memory.writeByte(0x1001, 0xFD);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x0FFF);
    });
  });
  describe('BVS', function() {
    it('should not branch', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0x70);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.ip, 0x1002);
    });
    it('should branch forwards', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = Flags.V;
      this.memory.writeByte(0x1000, 0x70);
      this.memory.writeByte(0x1001, 0x02);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x1004);
    });
    it('should branch backwards', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = Flags.V;
      this.memory.writeByte(0x1000, 0x70);
      this.memory.writeByte(0x1001, 0xFD);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x0FFF);
    });
  });
});
