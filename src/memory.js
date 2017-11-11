// @flow

import Keyboard from './Keyboard';

export default class Memory {
  static MEMORY_SIZE = 0x10000;
  static RAM_END = 0x8000;
  static VRAM_START = 0xD000;
  static VRAM_END = 0xD800;
  static KBD_START = 0xDF00;
  static KBD_END = 0xE000;

  _memory: Uint8Array;
  _screenWrites: boolean;
  _keyboard: Keyboard;

  constructor(keyboard: Keyboard) {
    this._memory = new Uint8Array(Memory.MEMORY_SIZE);
    this._keyboard = keyboard;
  }

  initializeRegion(data: Uint8Array, address: number): void {
    this._memory.set(data, address);
  }

  getVRAM(): Uint8Array {
    return this._memory.slice(Memory.VRAM_START, Memory.VRAM_END);
  }

  clearScreenWrites(): void {
    this._screenWrites = false;
  }

  screenWrites(): boolean {
    return this._screenWrites;
  }

  readByte(address: number): number {
    if (address >= Memory.KBD_START && address < Memory.KBD_END) {
      return this._keyboard.readByte();
    }

    return this._memory[address];
  }

  writeByte(address: number, data: number): void {
    if (address >= Memory.VRAM_START && address < Memory.VRAM_END) {
      this._memory[address] = data;
      this._screenWrites = true;
      return;
    }
    if (address >= Memory.KBD_START && address < Memory.KBD_END) {
      this._keyboard.writeByte(data);
      return;
    }

    if (address >= Memory.RAM_END) {
      return;
    }

    this._memory[address] = data;
  }
}
