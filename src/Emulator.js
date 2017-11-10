// @flow

import CPU from './CPU';
import Memory from './Memory';

export default class Emulator {
  static CLOCK_RATE = 1000 * 1000;
  static TICK_MS = 10;
  static CLOCKS_PER_TICK = (Emulator.CLOCK_RATE * Emulator.TICK_MS) / 1000;

  _cpu: CPU;
  _memory: Memory;

  constructor() {
    this._memory = new Memory();
    this._cpu = new CPU(this._memory);
  }

  async load() {
    await Promise.all([
      this._loadROM('SYN600.ROM', 0x0100, 0x0400, 0xFD00),
      this._loadROM('OSIBASIC.ROM', 0x0000, 0x2000, 0xA000)
    ]);

    this._cpu.reset();
    this._timeslice();
  }

  async _loadROM(
    url: string,
    romOffset: number,
    length: number,
    address: number
  ): Promise<void> {
    const response = await fetch(url);
    console.log(response);
    const rawData = await response.arrayBuffer();
    console.log(rawData);
    const bytes = new Uint8Array(rawData);
    console.log(bytes);
    const image = bytes.slice(romOffset, length);
    console.log(image);
    this._memory.initializeRegion(image, address);
  }

  _timeslice(): void {
    const start = performance.now();
    const startCycles = this._cpu.cycles();
    const cycleTarget = startCycles + Emulator.CLOCKS_PER_TICK;

    do {
      this._cpu.step();
    } while (!this._cpu.isHalted() && this._cpu.cycles() < cycleTarget);

    const end = performance.now();
    const delta = end - start;
    const cycles = this._cpu.cycles() - startCycles;
    console.log(`ran for ${delta} ms [${cycles} cycles]`);

    if (this._cpu.isHalted()) {
      console.log('CPU halted; stopping.');
      return;
    }

    const schedule = Math.max(1, Emulator.TICK_MS - delta);
    setTimeout(
      () => this._timeslice(),
      schedule
    );
  }
};
