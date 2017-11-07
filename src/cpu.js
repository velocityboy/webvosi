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
  _cycles: number;
  _halted: boolean;
  _dispatch: (() => void)[];

  ip: number;
  a: number;
  x: number;
  y: number;
  sp: number;
  flags: number;

  constructor(memory: Memory) {
    this._memory = memory;

    this._dispatch = [];
    while (this._dispatch.length < 256) {
      this._dispatch.push(this._invalidInstruction.bind(this));
    }

    this.reset();
  }

  reset() {
    this.sp = 0xFD;
    this.a = 0;
    this.x = 0;
    this.y = 0;
    this.flags = Flags.ALWAYS | Flags.DI;
    this.ip = this._readWord(CPU.RESET);
    this._cycles = 0;
    this._halted = false;
  }

  step() {
    if (this._halted) {
      return;
    }

    const op = this._memory.readByte(this.ip);
    this.ip = CPU._inc16(this.ip);
    this._dispatch[op]();
  }

  isHalted(): boolean {
    return this._halted;
  }

  _invalidInstruction(): void {
    this._halted = true;
  }

  _readWord(address: number): number {
    const low = this._memory.readByte(address);
    const high = this._memory.readByte(address + 1);
    return (high << 8) | low;
  }

  static _inc16(x: number): number {
    return (x + 1) & 0xFFFF;
  }
}
