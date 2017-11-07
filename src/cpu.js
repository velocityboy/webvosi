// @flow

import Memory from './Memory';

export class Flags {
  static C = 0x01;
  static Z = 0x02;
  static DI = 0x04;
  static D = 0x08;
  static B = 0x10;
  static ALWAYS = 0x20;
  static V = 0x40;
  static N = 0x80;
}

export default class CPU {
  static RESET = 0xFFFC;
  static BRK = 0xFFFE;
  static STACK_BASE = 0x0100;

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

    this._dispatch[0x00] = this._brk.bind(this);
    this._dispatch[0x05] = () => this._ora(this._zeroPage(), 3);
    this._dispatch[0x09] = () => this._ora(this._immediate(), 2);
    this._dispatch[0x0D] = () => this._ora(this._absolute(), 4);
    this._dispatch[0x15] = () => this._ora(this._zeroPageX(), 4);

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

  cycles(): number {
    return this._cycles;
  }

  _brk(): void {
    const ret = CPU._inc16(this.ip);
    const vector = this._readWord(CPU.BRK);

    if (this.sp <= 2) {
      this._halted = true;
      return;
    }

    this._memory.writeByte(this.sp | CPU.STACK_BASE, (ret >> 8) & 0xFF);
    this.sp -= 1;
    this._memory.writeByte(this.sp | CPU.STACK_BASE, ret & 0xFF);
    this.sp -= 1;
    this._memory.writeByte(this.sp | CPU.STACK_BASE, this.flags | Flags.B);
    this.sp -= 1;

    this.flags |= Flags.DI;

    this.ip = vector;
    this._cycles += 7;
  }

  _invalidInstruction(): void {
    this._halted = true;
  }

  _ora(m: number, cycles: number): void {
    this.a |= m;
    this._setClear(Flags.Z, this.a === 0);
    this._setClear(Flags.N, (this.a & 0x80) === 0x80);
    this._cycles += cycles;
  }

  _immediate(): number {
    const data = this._memory.readByte(this.ip);
    this.ip = CPU._inc16(this.ip);
    return data;
  }

  _zeroPage(): number {
    const addr = this._memory.readByte(this.ip);
    this.ip = CPU._inc16(this.ip);
    return this._memory.readByte(addr);
  }

  _zeroPageX(): number {
    let addr = this._memory.readByte(this.ip);
    this.ip = CPU._inc16(this.ip);
    addr = (addr + this.x) & 0xFF;
    return this._memory.readByte(addr);
  }

  _absolute(): number {
    const addrLow = this._memory.readByte(this.ip);
    this.ip = CPU._inc16(this.ip);
    const addrHigh = this._memory.readByte(this.ip);
    this.ip = CPU._inc16(this.ip);
    const addr = (addrHigh << 8) | addrLow;
    return this._memory.readByte(addr);
  }

  _setClear(flag: number, set: boolean) {
    if (set) {
      this.flags |= flag;
    } else {
      this.flags &= ~flag;
    }
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
