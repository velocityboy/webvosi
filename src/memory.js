// @flow

export default class Memory {
  static MEMORY_SIZE = 0x10000;
  static VRAM_START = 0xD000;
  static VRAM_END = 0xD800;

  _memory: Uint8Array;
  _screenWrites: boolean;

  constructor() {
    this._memory = new Uint8Array(Memory.MEMORY_SIZE);
  }

  initializeRegion(data: Uint8Array, address: number): void {
    this._memory.set(data, address);
  }

  readByte(address: number): number {
    return this._memory[address];
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

  writeByte(address: number, data: number): void {
    if (address >= Memory.VRAM_START && address < Memory.VRAM_END) {
      this._screenWrites = true;
    }

    this._memory[address] = data;
  }
}
