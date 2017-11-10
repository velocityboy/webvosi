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
    this._dispatch[0x08] = this._php.bind(this);
    this._dispatch[0x09] = () => this._ora(this._immediate(), 2);
    this._dispatch[0x0A] = () => this._asla();
    this._dispatch[0x0D] = () => this._ora(this._absolute(), 4);
    this._dispatch[0x0E] = () => this._aslm(this._absolute(), 6);

    this._dispatch[0x10] = this._bpl.bind(this);
    this._dispatch[0x11] = () => this._ora(this._indirectY(), 5);
    this._dispatch[0x15] = () => this._ora(this._zeroPageX(), 4);
    this._dispatch[0x16] = () => this._aslm(this._zeroPageX(), 6);
    this._dispatch[0x18] = this._clc.bind(this);
    this._dispatch[0x19] = () => this._ora(this._absoluteY(), 4);
    this._dispatch[0x1D] = () => this._ora(this._absoluteX(), 4);
    this._dispatch[0x1E] = () => this._aslm(this._absoluteX(), 7);

    this._dispatch[0x20] = this._jsr.bind(this);
    this._dispatch[0x21] = () => this._and(this._indirectX(), 6);
    this._dispatch[0x24] = () => this._bit(this._zeroPage(), 3);
    this._dispatch[0x25] = () => this._and(this._zeroPage(), 3);
    this._dispatch[0x26] = () => this._rolm(this._zeroPage(), 5);
    this._dispatch[0x28] = this._plp.bind(this);
    this._dispatch[0x29] = () => this._and(this._immediate(), 2);
    this._dispatch[0x2A] = this._rola.bind(this);
    this._dispatch[0x2C] = () => this._bit(this._absolute(), 4);
    this._dispatch[0x2D] = () => this._and(this._absolute(), 4);
    this._dispatch[0x2E] = () => this._rolm(this._absolute(), 6);

    this._dispatch[0x30] = this._bmi.bind(this);
    this._dispatch[0x31] = () => this._and(this._indirectY(), 5);
    this._dispatch[0x35] = () => this._and(this._zeroPageX(), 4);
    this._dispatch[0x36] = () => this._rolm(this._zeroPageX(), 6);
    this._dispatch[0x38] = this._sec.bind(this);
    this._dispatch[0x39] = () => this._and(this._absoluteY(), 4);
    this._dispatch[0x3D] = () => this._and(this._absoluteX(), 4);
    this._dispatch[0x3E] = () => this._rolm(this._absoluteX(), 7);

    this._dispatch[0x40] = this._rti.bind(this);
    this._dispatch[0x41] = () => this._eor(this._indirectX(), 6);
    this._dispatch[0x45] = () => this._eor(this._zeroPage(), 3);
    this._dispatch[0x46] = () => this._lsrm(this._zeroPage(), 5);
    this._dispatch[0x48] = this._pha.bind(this);
    this._dispatch[0x49] = () => this._eor(this._immediate(), 2);
    this._dispatch[0x4A] = this._lsra.bind(this);
    this._dispatch[0x4C] = () => this._jmp(this._absolute(), 3);
    this._dispatch[0x4D] = () => this._eor(this._absolute(), 4);
    this._dispatch[0x4E] = () => this._lsrm(this._absolute(), 6);

    this._dispatch[0x50] = this._bvc.bind(this);
    this._dispatch[0x51] = () => this._eor(this._indirectY(), 5);
    this._dispatch[0x55] = () => this._eor(this._zeroPageX(), 4);
    this._dispatch[0x56] = () => this._lsrm(this._zeroPageX(), 6);
    this._dispatch[0x58] = this._cli.bind(this);
    this._dispatch[0x59] = () => this._eor(this._absoluteY(), 4);
    this._dispatch[0x5D] = () => this._eor(this._absoluteX(), 4);
    this._dispatch[0x5E] = () => this._lsrm(this._absoluteX(), 7);

    this._dispatch[0x60] = this._rts.bind(this);
    this._dispatch[0x61] = () => this._adc(this._indirectX(), 6);
    this._dispatch[0x65] = () => this._adc(this._zeroPage(), 3);
    this._dispatch[0x66] = () => this._rorm(this._zeroPage(), 5);
    this._dispatch[0x68] = this._pla.bind(this);
    this._dispatch[0x69] = () => this._adc(this._immediate(), 2);
    this._dispatch[0x6A] = this._rora.bind(this);
    this._dispatch[0x6C] = () => this._jmp(this._indirect(), 5);
    this._dispatch[0x6D] = () => this._adc(this._absolute(), 4);
    this._dispatch[0x6E] = () => this._rorm(this._absolute(), 6);

    this._dispatch[0x70] = this._bvs.bind(this);
    this._dispatch[0x71] = () => this._adc(this._indirectY(), 5);
    this._dispatch[0x75] = () => this._adc(this._zeroPageX(), 4);
    this._dispatch[0x76] = () => this._rorm(this._zeroPageX(), 6);
    this._dispatch[0x78] = this._sei.bind(this);
    this._dispatch[0x79] = () => this._adc(this._absoluteY(), 4);
    this._dispatch[0x7D] = () => this._adc(this._absoluteX(), 4);
    this._dispatch[0x7E] = () => this._rorm(this._absoluteX(), 7);

    this._dispatch[0x81] = () => this._sta(this._indirectX(), 6);
    this._dispatch[0x84] = () => this._sty(this._zeroPage(), 3);
    this._dispatch[0x85] = () => this._sta(this._zeroPage(), 3);
    this._dispatch[0x86] = () => this._stx(this._zeroPage(), 3);
    this._dispatch[0x88] = this._dey.bind(this);
    this._dispatch[0x8C] = () => this._sty(this._absolute(), 4);
    this._dispatch[0x8D] = () => this._sta(this._absolute(), 4);
    this._dispatch[0x8E] = () => this._stx(this._absolute(), 4);

    this._dispatch[0x90] = this._bcc.bind(this);
    this._dispatch[0x91] = () => this._sta(this._indirectY(), 6);
    this._dispatch[0x94] = () => this._sty(this._zeroPageX(), 4);
    this._dispatch[0x95] = () => this._sta(this._zeroPageX(), 4);
    this._dispatch[0x96] = () => this._stx(this._zeroPageY(), 4);
    this._dispatch[0x99] = () => this._sta(this._absoluteY(), 5);
    this._dispatch[0x9D] = () => this._sta(this._absoluteX(), 5);

    this._dispatch[0xA0] = () => this._ldy(this._immediate(), 2);
    this._dispatch[0xA1] = () => this._lda(this._indirectX(), 6);
    this._dispatch[0xA2] = () => this._ldx(this._immediate(), 2);
    this._dispatch[0xA4] = () => this._ldy(this._zeroPage(), 3);
    this._dispatch[0xA5] = () => this._lda(this._zeroPage(), 3);
    this._dispatch[0xA6] = () => this._ldx(this._zeroPage(), 3);
    this._dispatch[0xA8] = this._tay.bind(this);
    this._dispatch[0xA9] = () => this._lda(this._immediate(), 2);
    this._dispatch[0xAA] = this._tax.bind(this);
    this._dispatch[0xAC] = () => this._ldy(this._absolute(), 4);
    this._dispatch[0xAD] = () => this._lda(this._absolute(), 4);
    this._dispatch[0xAE] = () => this._ldx(this._absolute(), 4);

    this._dispatch[0xB0] = this._bcs.bind(this);
    this._dispatch[0xB1] = () => this._lda(this._indirectY(), 5);
    this._dispatch[0xB4] = () => this._ldy(this._zeroPageX(), 4);
    this._dispatch[0xB5] = () => this._lda(this._zeroPageX(), 4);
    this._dispatch[0xB6] = () => this._ldx(this._zeroPageY(), 4);
    this._dispatch[0xB8] = this._clv.bind(this);
    this._dispatch[0xB9] = () => this._lda(this._absoluteY(), 4);
    this._dispatch[0xBA] = this._tsx.bind(this);
    this._dispatch[0xBC] = () => this._ldy(this._absoluteX(), 4);
    this._dispatch[0xBD] = () => this._lda(this._absoluteX(), 4);
    this._dispatch[0xBE] = () => this._ldx(this._absoluteY(), 4);

    this._dispatch[0xC0] = () => this._cpy(this._immediate(), 2);
    this._dispatch[0xC1] = () => this._cmp(this._indirectX(), 6);
    this._dispatch[0xC4] = () => this._cpy(this._zeroPage(), 3);
    this._dispatch[0xC5] = () => this._cmp(this._zeroPage(), 3);
    this._dispatch[0xC6] = () => this._dec(this._zeroPage(), 5);
    this._dispatch[0xC8] = this._iny.bind(this);
    this._dispatch[0xC9] = () => this._cmp(this._immediate(), 2);
    this._dispatch[0xCA] = this._dex.bind(this);
    this._dispatch[0xCC] = () => this._cpy(this._absolute(), 4);
    this._dispatch[0xCD] = () => this._cmp(this._absolute(), 4);
    this._dispatch[0xCE] = () => this._dec(this._absolute(), 6);

    this._dispatch[0xD0] = this._bne.bind(this);
    this._dispatch[0xD1] = () => this._cmp(this._indirectY(), 5);
    this._dispatch[0xD5] = () => this._cmp(this._zeroPageX(), 4);
    this._dispatch[0xD6] = () => this._dec(this._zeroPageX(), 6);
    this._dispatch[0xD8] = this._cld.bind(this);
    this._dispatch[0xD9] = () => this._cmp(this._absoluteY(), 4);
    this._dispatch[0xDD] = () => this._cmp(this._absoluteX(), 4);
    this._dispatch[0xDE] = () => this._dec(this._absoluteX(), 7);

    this._dispatch[0xE0] = () => this._cpx(this._immediate(), 2);
    this._dispatch[0xE1] = () => this._sbc(this._indirectX(), 6);
    this._dispatch[0xE4] = () => this._cpx(this._zeroPage(), 3);
    this._dispatch[0xE5] = () => this._sbc(this._zeroPage(), 3);
    this._dispatch[0xE6] = () => this._inc(this._zeroPage(), 5);
    this._dispatch[0xE8] = this._inx.bind(this);
    this._dispatch[0xE9] = () => this._sbc(this._immediate(), 2);
    this._dispatch[0xEA] = this._nop.bind(this);
    this._dispatch[0xEC] = () => this._cpx(this._absolute(), 4);
    this._dispatch[0xED] = () => this._sbc(this._absolute(), 4);
    this._dispatch[0xEE] = () => this._inc(this._absolute(), 6);

    this._dispatch[0xF0] = this._beq.bind(this);
    this._dispatch[0xF1] = () => this._sbc(this._indirectY(), 5);
    this._dispatch[0xF5] = () => this._sbc(this._zeroPageX(), 4);
    this._dispatch[0xF6] = () => this._inc(this._zeroPageX(), 6);
    this._dispatch[0xF8] = this._sed.bind(this);
    this._dispatch[0xF9] = () => this._sbc(this._absoluteY(), 4);
    this._dispatch[0xFD] = () => this._sbc(this._absoluteX(), 4);
    this._dispatch[0xFE] = () => this._inc(this._absoluteX(), 7);



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

  _invalidInstruction(): void {
    this._halted = true;
  }

  _adc(addr: number, cycles: number): void {
    const m = this._memory.readByte(addr);
    const sum = this.a + m + (this.flags & Flags.C);
    this._setClear(Flags.Z, (sum & 0xFF) === 0);
    this._setClear(Flags.N, (sum & 0x80) === 0x80);
    this._setClear(Flags.C, sum >= 0x0100);
    this._setClear(Flags.V,
      ((~(this.a ^ m)) & (this.a ^ sum) & 0x80) != 0
    );

    this.a = sum & 0xFF;
    this._cycles += cycles;
  }

  _and(addr: number, cycles: number): void {
    const m = this._memory.readByte(addr);
    this.a &= m;
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

  _bcc(): void {
    const offset = CPU._byteToSigned(this._memory.readByte(this.ip));

    if ((this.flags & Flags.C) === 0) {
      this.ip = (this.ip + 1 + offset) & 0xFFFF;
      this._cycles += 3;
      return;
    }

    this.ip = CPU._inc16(this.ip);
    this._cycles += 2;
  }

  _bcs(): void {
    const offset = CPU._byteToSigned(this._memory.readByte(this.ip));

    if ((this.flags & Flags.C) !== 0) {
      this.ip = (this.ip + 1 + offset) & 0xFFFF;
      this._cycles += 3;
      return;
    }

    this.ip = CPU._inc16(this.ip);
    this._cycles += 2;
  }

  _beq(): void {
    const offset = CPU._byteToSigned(this._memory.readByte(this.ip));

    if ((this.flags & Flags.Z) !== 0) {
      this.ip = (this.ip + 1 + offset) & 0xFFFF;
      this._cycles += 3;
      return;
    }

    this.ip = CPU._inc16(this.ip);
    this._cycles += 2;
  }

  _bit(addr: number, cycles: number): void {
    const m = this.a & this._memory.readByte(addr);
    this._setClear(Flags.V, (m & 0x40) !== 0);
    this._setClear(Flags.N, (m & 0x80) !== 0);
    this._cycles += cycles;
  }

  _bmi(): void {
    const offset = CPU._byteToSigned(this._memory.readByte(this.ip));

    if ((this.flags & Flags.N) !== 0) {
      this.ip = (this.ip + 1 + offset) & 0xFFFF;
      this._cycles += 3;
      return;
    }

    this.ip = CPU._inc16(this.ip);
    this._cycles += 2;
  }

  _bne(): void {
    const offset = CPU._byteToSigned(this._memory.readByte(this.ip));

    if ((this.flags & Flags.Z) === 0) {
      this.ip = (this.ip + 1 + offset) & 0xFFFF;
      this._cycles += 3;
      return;
    }

    this.ip = CPU._inc16(this.ip);
    this._cycles += 2;
  }

  _bpl(): void {
    const offset = CPU._byteToSigned(this._memory.readByte(this.ip));

    if ((this.flags & Flags.N) === 0) {
      this.ip = (this.ip + 1 + offset) & 0xFFFF;
      this._cycles += 3;
      return;
    }

    this.ip = CPU._inc16(this.ip);
    this._cycles += 2;
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

  _bvc(): void {
    const offset = CPU._byteToSigned(this._memory.readByte(this.ip));

    if ((this.flags & Flags.V) === 0) {
      this.ip = (this.ip + 1 + offset) & 0xFFFF;
      this._cycles += 3;
      return;
    }

    this.ip = CPU._inc16(this.ip);
    this._cycles += 2;
  }

  _bvs(): void {
    const offset = CPU._byteToSigned(this._memory.readByte(this.ip));

    if ((this.flags & Flags.V) !== 0) {
      this.ip = (this.ip + 1 + offset) & 0xFFFF;
      this._cycles += 3;
      return;
    }

    this.ip = CPU._inc16(this.ip);
    this._cycles += 2;
  }

  _clc(): void {
    this.flags &= ~Flags.C;
    this._cycles += 2;
  }

  _cld(): void {
    this.flags &= ~Flags.D;
    this._cycles += 2;
  }

  _cli(): void {
    this.flags &= ~Flags.DI;
    this._cycles += 2;
  }

  _clv(): void {
    this.flags &= ~Flags.V;
    this._cycles += 2;
  }

  _cmp(addr: number, cycles: number): void {
    const m = this.a - this._memory.readByte(addr);

    this._setClear(Flags.Z, (m & 0xFF) === 0);
    this._setClear(Flags.N, (m & 0x80) === 0x80);
    this._setClear(Flags.C, (m & 0x100) === 0);

    this._cycles += cycles;
  }

  _cpx(addr: number, cycles: number): void {
    const m = this.x - this._memory.readByte(addr);

    this._setClear(Flags.Z, (m & 0xFF) === 0);
    this._setClear(Flags.N, (m & 0x80) === 0x80);
    this._setClear(Flags.C, (m & 0x100) === 0);

    this._cycles += cycles;
  }

  _cpy(addr: number, cycles: number): void {
    const m = this.y - this._memory.readByte(addr);

    this._setClear(Flags.Z, (m & 0xFF) === 0);
    this._setClear(Flags.N, (m & 0x80) === 0x80);
    this._setClear(Flags.C, (m & 0x100) === 0);

    this._cycles += cycles;
  }

  _dec(addr: number, cycles: number): void {
    const m = (this._memory.readByte(addr) - 1) & 0xFF;

    this._setClear(Flags.Z, m === 0);
    this._setClear(Flags.N, (m & 0x80) === 0x80);

    this._memory.writeByte(addr, m);

    this._cycles += cycles;
  }

  _dex(): void {
    this.x = (this.x - 1) & 0xFF;

    this._setClear(Flags.Z, this.x === 0);
    this._setClear(Flags.N, (this.x & 0x80) === 0x80);

    this._cycles += 2;
  }

  _dey(): void {
    this.y = (this.y - 1) & 0xFF;

    this._setClear(Flags.Z, this.y === 0);
    this._setClear(Flags.N, (this.y & 0x80) === 0x80);

    this._cycles += 2;
  }

  _eor(addr: number, cycles: number): void {
    this.a = this.a ^ this._memory.readByte(addr);

    this._setClear(Flags.Z, this.a === 0);
    this._setClear(Flags.N, (this.a & 0x80) === 0x80);

    this._cycles += cycles;
  }

  _inc(addr: number, cycles: number): void {
    const m = (this._memory.readByte(addr) + 1) & 0xFF;

    this._setClear(Flags.Z, m === 0);
    this._setClear(Flags.N, (m & 0x80) === 0x80);

    this._memory.writeByte(addr, m);

    this._cycles += cycles;
  }

  _inx(): void {
    this.x = (this.x + 1) & 0xFF;

    this._setClear(Flags.Z, this.x === 0);
    this._setClear(Flags.N, (this.x & 0x80) === 0x80);

    this._cycles += 2;
  }

  _iny(): void {
    this.y = (this.y + 1) & 0xFF;

    this._setClear(Flags.Z, this.y === 0);
    this._setClear(Flags.N, (this.y & 0x80) === 0x80);

    this._cycles += 2;
  }

  _jmp(addr: number, cycles: number): void {
    this.ip = addr;
    this._cycles += cycles;
  }

  _jsr(): void {
    if (this.sp < 2) {
      this._halted = true;
      return;
    }

    const addr = this._readWord(this.ip);

    // NB jsr actually stores the address of the byte *before*
    // the return address
    this.ip = CPU._inc16(this.ip);

    this._memory.writeByte(0x0100 | this.sp, (this.ip >> 8) & 0xFF);
    this.sp--;
    this._memory.writeByte(0x0100 | this.sp, this.ip & 0xFF);
    this.sp--;

    this.ip = addr;
    this._cycles += 6;
  }

  _lda(addr: number, cycles: number): void {
    this.a = this._memory.readByte(addr);
    this._setClear(Flags.Z, this.a === 0);
    this._setClear(Flags.N, (this.a & 0x80) === 0x80);
    this._cycles += cycles;
  }

  _ldx(addr: number, cycles: number): void {
    this.x = this._memory.readByte(addr);
    this._setClear(Flags.Z, this.x === 0);
    this._setClear(Flags.N, (this.x & 0x80) === 0x80);
    this._cycles += cycles;
  }

  _ldy(addr: number, cycles: number): void {
    this.y = this._memory.readByte(addr);
    this._setClear(Flags.Z, this.y === 0);
    this._setClear(Flags.N, (this.y & 0x80) === 0x80);
    this._cycles += cycles;
  }

  _lsr(value: number): number {
    this._setClear(Flags.C, (value & 0x01) === 0x01);
    value = value >> 1;
    this._setClear(Flags.Z, value === 0);
    this._setClear(Flags.N, false);

    return value;
  }

  _lsra(): void {
    this.a = this._lsr(this.a);
    this._cycles += 2;
  }

  _lsrm(addr: number, cycles: number): void {
    let x = this._memory.readByte(addr);
    x = this._lsr(x);
    this._memory.writeByte(addr, x);
    this._cycles += cycles;
  }

  _nop(): void {
    this._cycles += 2;
  }

  _ora(addr: number, cycles: number): void {
    const m = this._memory.readByte(addr);
    this.a |= m;
    this._setClear(Flags.Z, this.a === 0);
    this._setClear(Flags.N, (this.a & 0x80) === 0x80);
    this._cycles += cycles;
  }

  _pha(): void {
    if (this.sp == 0) {
      this._halted = true;
      return;
    }

    this._memory.writeByte(0x0100 | this.sp, this.a);
    this.sp--;
    this._cycles += 3;
  }

  _php(): void {
    if (this.sp == 0) {
      this._halted = true;
      return;
    }

    this._memory.writeByte(0x0100 | this.sp, this.flags);
    this.sp--;
    this._cycles += 3;
  }

  _pla(): void {
    if (this.sp == 0xFF) {
      this._halted = true;
      return;
    }
    this.sp++;
    this.a = this._memory.readByte(0x0100 | this.sp);

    this._setClear(Flags.Z, this.a === 0);
    this._setClear(Flags.N, (this.a & 0x80) === 0x80);

    this._cycles += 4;
  }

  _plp(): void {
    if (this.sp == 0xFF) {
      this._halted = true;
      return;
    }
    this.sp++;
    this.flags = this._memory.readByte(0x0100 | this.sp);

    this._cycles += 4;
  }

  _rol(value: number): number {
    value = value << 1;

    if ((this.flags & Flags.C) != 0) {
      value |= 0x01;
    }

    this._setClear(Flags.C, (value & 0x0100) === 0x0100);
    value &= 0xFF;
    this._setClear(Flags.Z, value === 0);
    this._setClear(Flags.N, (value & 0x80) == 0x80);

    return value;
  }

  _rola(): void {
    this.a = this._rol(this.a);
    this._cycles += 2;
  }

  _rolm(addr: number, cycles: number): void {
    let x = this._memory.readByte(addr);
    x = this._rol(x);
    this._memory.writeByte(addr, x);
    this._cycles += cycles;
  }

  _ror(value: number): number {
    const oldValue = value;
    value = value >> 1;

    if ((this.flags & Flags.C) != 0) {
      value |= 0x80;
    }

    this._setClear(Flags.C, (oldValue & 0x01) == 0x01);
    this._setClear(Flags.Z, value === 0);
    this._setClear(Flags.N, (value & 0x80) == 0x80);

    return value;
  }

  _rora(): void {
    this.a = this._ror(this.a);
    this._cycles += 2;
  }

  _rorm(addr: number, cycles: number): void {
    let x = this._memory.readByte(addr);
    x = this._ror(x);
    this._memory.writeByte(addr, x);
    this._cycles += cycles;
  }

  _rti(): void {
    if (this.sp >= 0xFD) {
      this._halted = true;
      return;
    }

    this.flags &= Flags.ALWAYS;

    this.sp++;
    this.flags |= (this._memory.readByte(this.sp) & ~Flags.ALWAYS);
    this.sp++;
    const low = this._memory.readByte(this.sp);
    this.sp++;
    const high = this._memory.readByte(this.sp);

    this.ip = (high << 8) | low;
    this._cycles += 6;
  }

  _rts(): void {
    if (this.sp >= 0xFE) {
      this._halted = true;
      return;
    }

    this.sp++;
    const low = this._memory.readByte(this.sp);
    this.sp++;
    const high = this._memory.readByte(this.sp);

    this.ip = CPU._inc16((high << 8) | low);
    this._cycles += 6;
  }

  _sbc(addr: number, cycles: number): void {
    const m = this._memory.readByte(addr);
    let result = this.a - m;
    if ((this.flags & Flags.C) == 0) {
      result--;
    }

    this._setClear(Flags.V,
      (((this.a ^ m)) & (this.a ^ result) & 0x80) != 0
    );

    this._setClear(Flags.Z, (result & 0xFF) === 0);
    this._setClear(Flags.N, (result & 0x80) === 0x80);
    this._setClear(Flags.C, (result & 0x100) === 0);

    this.a = result & 0xFF;

    this._cycles += cycles;
  }

  _sec(): void {
    this.flags |= Flags.C;
    this._cycles += 2;
  }

  _sed(): void {
    this.flags |= Flags.D;
    this._cycles += 2;
  }

  _sei(): void {
    this.flags |= Flags.DI;
    this._cycles += 2;
  }

  _sta(address: number, cycles: number): void {
    this._memory.writeByte(address, this.a);
    this._cycles += cycles;
  }

  _stx(address: number, cycles: number): void {
    this._memory.writeByte(address, this.x);
    this._cycles += cycles;
  }

  _sty(address: number, cycles: number): void {
    this._memory.writeByte(address, this.y);
    this._cycles += cycles;
  }

  _tax(): void {
    this.x = this.a;
    this._setClear(Flags.Z, this.x === 0);
    this._setClear(Flags.N, (this.x & 0x80) === 0x80);
    this._cycles += 2;
  }

  _tay(): void {
    this.y = this.a;
    this._setClear(Flags.Z, this.y === 0);
    this._setClear(Flags.N, (this.y & 0x80) === 0x80);
    this._cycles += 2;
  }

  _tsx(): void {
    this.x = this.s;
    this._setClear(Flags.Z, this.x === 0);
    this._setClear(Flags.N, (this.x & 0x80) === 0x80);
    this._cycles += 2;
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

  _zeroPageY(): number {
    const addr = (this._memory.readByte(this.ip) + this.y) & 0xFF;
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

  _indirect(): number {
    const addr = this._readWord(this._readWord(this.ip));
    this.ip += 2;
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

  static _byteToSigned(n: number): number {
    if ((n & 0x80) === 0) {
      return n;
    }

    return -((~n+1) & 0xFF);
  }
}
