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
    this._dispatch[0x01] = () => this._ora(this._indirectX(), 6);
    this._dispatch[0x05] = () => this._ora(this._zeroPage(), 3);
    this._dispatch[0x06] = () => this._aslm(this._zeroPage(), 5);
    this._dispatch[0x09] = () => this._ora(this._immediate(), 2);
    this._dispatch[0x0A] = () => this._asla();
    this._dispatch[0x0D] = () => this._ora(this._absolute(), 4);
    this._dispatch[0x0E] = () => this._aslm(this._absolute(), 6);
    this._dispatch[0x11] = () => this._ora(this._indirectY(), 5);
    this._dispatch[0x15] = () => this._ora(this._zeroPageX(), 4);
    this._dispatch[0x16] = () => this._aslm(this._zeroPageX(), 6);
    this._dispatch[0x19] = () => this._ora(this._absoluteY(), 4);
    this._dispatch[0x1D] = () => this._ora(this._absoluteX(), 4);
    this._dispatch[0x1E] = () => this._aslm(this._absoluteX(), 7);
    this._dispatch[0x21] = () => this._and(this._indirectX(), 6);
    this._dispatch[0x25] = () => this._and(this._zeroPage(), 3);
    this._dispatch[0x29] = () => this._and(this._immediate(), 2);
    this._dispatch[0x2D] = () => this._and(this._absolute(), 4);
    this._dispatch[0x31] = () => this._and(this._indirectY(), 5);
    this._dispatch[0x35] = () => this._and(this._zeroPageX(), 4);
    this._dispatch[0x39] = () => this._and(this._absoluteY(), 4);
    this._dispatch[0x3D] = () => this._and(this._absoluteX(), 4);


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

  _and(addr: number, cycles: number): void {
    const m = this._memory.readByte(addr);
    this.a &= m;
    this._setClear(Flags.Z, this.a === 0);
    this._setClear(Flags.N, (this.a & 0x80) === 0x80);
    this._cycles += cycles;
  }

  _and(addr: number, cycles: number): void {
    const m = this._memory.readByte(addr);
    this.a &= m;
    this._setClear(Flags.Z, this.a === 0);
    this._setClear(Flags.N, (this.a & 0x80) === 0x80);
    this._cycles += cycles;
  }

  _ora(addr: number, cycles: number): void {
    const m = this._memory.readByte(addr);
    this.a |= m;
    this._setClear(Flags.Z, this.a === 0);
    this._setClear(Flags.N, (this.a & 0x80) === 0x80);
    this._cycles += cycles;
  }

  _asl(value: number): number {
    value = value << 1;
    this._setClear(Flags.Z, value === 0);
    this._setClear(Flags.N, (value & 0x80) === 0x80);
    this._setClear(Flags.C, (value & 0x100) === 0x100);

    return value & 0xFF;
  }

  _asla(): void {
    this.a = this._asl(this.a);
    this._cycles += 2;
  }

  _aslm(addr: number, cycles: number): void {
    let x = this._memory.readByte(addr);
    x = this._asl(x);
    this._memory.writeByte(addr, x);
    this._cycles += cycles;
  }

  _immediate(): number {
    const addr = this.ip;
    this.ip = CPU._inc16(this.ip);
    return addr;
  }

  _zeroPage(): number {
    const addr = this._memory.readByte(this.ip);
    this.ip = CPU._inc16(this.ip);
    return addr;
  }

  _zeroPageX(): number {
    const addr = (this._memory.readByte(this.ip) + this.x) & 0xFF;
    this.ip = CPU._inc16(this.ip);
    return addr;
  }

  _absolute(): number {
    const addr = this._readWord(this.ip);
    this.ip = CPU._inc16(this.ip, 2);
    return addr;
  }

  _absoluteX(): number {
    const addr = (this._readWord(this.ip) + this.x) & 0xFFFF;
    this.ip = CPU._inc16(this.ip, 2);
    return addr;
  }

  _absoluteY(): number {
    const addr = (this._readWord(this.ip) + this.y) & 0xFFFF;
    this.ip = CPU._inc16(this.ip, 2);
    return addr;
  }

  _indirectX(): number  {
    const zpaddr = (this._memory.readByte(this.ip) + this.x) & 0xFF;
    this.ip = CPU._inc16(this.ip);
    const addr = this._readWord(zpaddr);
    return addr;
  }

  _indirectY(): number  {
    const zpaddr = this._memory.readByte(this.ip);
    this.ip = CPU._inc16(this.ip);
    const addr = (this._readWord(zpaddr) + this.y) & 0xFFFF;
    return addr;
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

  static _inc16(x: number, inc: ?number = 1): number {
    return (x + inc) & 0xFFFF;
  }
}
