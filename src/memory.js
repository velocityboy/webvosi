// @flow

export default class Memory {
  _memory: Uint8Array;

  constructor() {
    this._memory = new Uint8Array(0x10000);
  }

  initializeRegion(data: Uint8Array, address: number): void {
    this._memory.set(data, address);
  }

  readByte(address: number): number {
    return this._memory[address];
  }

  writeByte(address: number, data: number): void {
    this._memory[address] = data;
  }
}
