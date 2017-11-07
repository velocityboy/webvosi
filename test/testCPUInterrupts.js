var assert = require('assert');
var Memory = require('../out/Memory').default;
var CPU = require('../out/CPU').default;
var Flags = require('../out/CPU').Flags;

describe('CPU Interrupts', function() {
  it('BRK should interrupt properly', function() {
    this.cpu.sp = 0xFF;
    this.cpu.ip = 0x1000;
    this.cpu.flags = Flags.C;
    this.memory.writeByte(0x1000, 0x00);

    const startCycles = this.cpu.cycles();
    this.cpu.step();
    assert.equal(this.cpu.cycles() - startCycles, 7);
    assert.equal(this.cpu.flags, Flags.C | Flags.DI);
    assert.equal(this.cpu.sp, 0xFC);
    assert.equal(this.memory.readByte(0x01FF), 0x10);
    assert.equal(this.memory.readByte(0x01FE), 0x02);
    assert.equal(this.memory.readByte(0x01FD), Flags.C | Flags.B);
  })
})
