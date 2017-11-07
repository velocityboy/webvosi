// @flow

import Memory from './Memory';

export class Flags {
  static C = 0x01;
  static Z = 0x02;
  static DI = 0x04;
  static D = 0x08;
  static ALWAYS = 0x20;
  static V = 0x40;
  static N = 0x80;

}

export default class CPU {
  static RESET = 0xFFFC;

  _memory: Memory;
  ip: number;
  a: number;
  x: number;
  y: number;
  sp: number;
  flags: number;

  constructor(memory: Memory) {
    this._memory = memory;
    this.reset();
  }

  reset() {
    this.sp = 0xFD;
    this.a = 0;
    this.x = 0;
    this.y = 0;
    this.flags = Flags.ALWAYS | Flags.DI;
    this.ip = this._readWord(CPU.RESET);
  }

  _readWord(address: number): number {
    const low = this._memory.readByte(address);
    const high = this._memory.readByte(address + 1);
    return (high << 8) | low;
  }
}
