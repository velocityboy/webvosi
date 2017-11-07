var assert = require('assert');
var Memory = require('../out/Memory').default;
var CPU = require('../out/CPU').default;
var Flags = require('../out/CPU').Flags;

beforeEach(function() {
  this.memory = new Memory();
  this.cpu = new CPU(this.memory);
})

describe('CPU', function() {
  it('should properly reset', function() {
    this.memory.writeByte(0xFFFC, 0x34);
    this.memory.writeByte(0xFFFD, 0x12);
    this.cpu.reset();

    assert.equal(this.cpu.a, 0x00);
    assert.equal(this.cpu.x, 0x00);
    assert.equal(this.cpu.y, 0x00);
    assert.equal(this.cpu.ip, 0x1234);
  })
})
