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
  describe('JMP', function() {
    it('should jmp directly', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0x4C);
      this.memory.writeByte(0x1001, 0x34);
      this.memory.writeByte(0x1002, 0x12);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 3);
      assert.equal(this.cpu.ip, 0x1234);
    });
    it('should jmp indirectly', function() {
      this.cpu.ip = 0x1000;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0x6C);
      this.memory.writeByte(0x1001, 0x34);
      this.memory.writeByte(0x1002, 0x12);
      this.memory.writeByte(0x1234, 0x78);
      this.memory.writeByte(0x1235, 0x56);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 5);
      assert.equal(this.cpu.ip, 0x5678);
    });
  });
  describe('JSR', function() {
    it('should jump to subroutine', function() {
      this.cpu.ip = 0x1000;
      this.cpu.sp = 0xFF;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0x20);
      this.memory.writeByte(0x1001, 0x34);
      this.memory.writeByte(0x1002, 0x12);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 6);
      assert.equal(this.cpu.ip, 0x1234);
      assert.equal(this.cpu.sp, 0xFD);
      assert.equal(this.memory.readByte(0x01FE), 0x02);
      assert.equal(this.memory.readByte(0x01FF), 0x10);
    });
    it('should halt on stack exception', function() {
      this.cpu.ip = 0x1000;
      this.cpu.sp = 0x01;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x1000, 0x20);
      this.memory.writeByte(0x1001, 0x34);
      this.memory.writeByte(0x1002, 0x12);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.isHalted(), true);
    });
  });
  describe('NOP', function() {
    it('should do nothing', function() {
      this.cpu.ip = 0x1000;
      this.memory.writeByte(0x1000, 0xEA);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 2);
      assert.equal(this.cpu.ip, 0x1001);
    });
  });
  describe('RTS', function() {
    it('should restore the program counter', function() {
      this.cpu.ip = 0x1000;
      this.cpu.sp = 0xFD;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x01FE, 0x33);
      this.memory.writeByte(0x01FF, 0x12);
      this.memory.writeByte(0x1000, 0x60);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 6);
      assert.equal(this.cpu.flags, 0x00);
      assert.equal(this.cpu.ip, 0x1234);
    });
    it('should overflow the stack', function() {
      this.cpu.ip = 0x1000;
      this.cpu.sp = 0xFE;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x01FD, 0xFF);
      this.memory.writeByte(0x01FE, 0x34);
      this.memory.writeByte(0x01FF, 0x12);
      this.memory.writeByte(0x1000, 0x60);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.isHalted(), true);
    });
  });
  describe('RTI', function() {
    it('should restore processor state', function() {
      this.cpu.ip = 0x1000;
      this.cpu.sp = 0xFC;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x01FD, 0xFF);
      this.memory.writeByte(0x01FE, 0x34);
      this.memory.writeByte(0x01FF, 0x12);
      this.memory.writeByte(0x1000, 0x40);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.cycles() - startCycles, 6);
      assert.equal(this.cpu.flags, 0xDF);
      assert.equal(this.cpu.ip, 0x1234);
    });
    it('should overflow the stack', function() {
      this.cpu.ip = 0x1000;
      this.cpu.sp = 0xFD;
      this.cpu.flags = 0x00;
      this.memory.writeByte(0x01FD, 0xFF);
      this.memory.writeByte(0x01FE, 0x34);
      this.memory.writeByte(0x01FF, 0x12);
      this.memory.writeByte(0x1000, 0x40);

      const startCycles = this.cpu.cycles();
      this.cpu.step();
      assert.equal(this.cpu.isHalted(), true);
    });
  });
});
