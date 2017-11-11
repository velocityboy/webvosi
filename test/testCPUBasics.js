var assert = require('assert');
var Memory = require('../out/Memory').default;
var CPU = require('../out/CPU').default;
var Flags = require('../out/CPU').Flags;

beforeEach(function() {
  this.memory = new Memory();
  this.cpu = new CPU(this.memory);
})

describe('CPU', function() {
  it ('should halt on invalid instruction', function () {
    this.cpu.ip = 0x1000;
    // 0x02 is invalid opcode
    this.memory.writeByte(0x1000, 0x02);

    assert.equal(this.cpu.isHalted(), false);
    this.cpu.step();
    assert.equal(this.cpu.isHalted(), true);
  })
})
