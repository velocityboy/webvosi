// @flow

import invariant from 'assert';

type KeymapEntry = {
  row: number;
  mask: number;
  needsShift: boolean;
  isMeta: boolean;
};

const keymap: Map<string, KeymapEntry> = new Map([
  // meta keys
  ['CapsLock', { row: 0, mask: 0x01, needsShift: false, isMeta: true}],
  ['Control', { row: 0, mask: 0x40, needsShift: false, isMeta: true}],

  // upper/lower alpha map to the same entries, the VM's code will sort
  // out shift based on what we tell it
  ['a', { row: 1, mask: 0x40, needsShift: false, isMeta: false}],
  ['b', { row: 2, mask: 0x10, needsShift: false, isMeta: false}],
  ['c', { row: 2, mask: 0x40, needsShift: false, isMeta: false}],
  ['d', { row: 3, mask: 0x40, needsShift: false, isMeta: false}],
  ['e', { row: 4, mask: 0x40, needsShift: false, isMeta: false}],
  ['f', { row: 3, mask: 0x20, needsShift: false, isMeta: false}],
  ['g', { row: 3, mask: 0x10, needsShift: false, isMeta: false}],
  ['h', { row: 3, mask: 0x08, needsShift: false, isMeta: false}],
  ['i', { row: 4, mask: 0x02, needsShift: false, isMeta: false}],
  ['j', { row: 3, mask: 0x04, needsShift: false, isMeta: false}],
  ['k', { row: 3, mask: 0x02, needsShift: false, isMeta: false}],
  ['l', { row: 5, mask: 0x40, needsShift: false, isMeta: false}],
  ['m', { row: 2, mask: 0x04, needsShift: false, isMeta: false}],
  ['n', { row: 2, mask: 0x08, needsShift: false, isMeta: false}],
  ['o', { row: 5, mask: 0x20, needsShift: false, isMeta: false}],
  ['p', { row: 1, mask: 0x02, needsShift: false, isMeta: false}],
  ['q', { row: 1, mask: 0x80, needsShift: false, isMeta: false}],
  ['r', { row: 4, mask: 0x20, needsShift: false, isMeta: false}],
  ['s', { row: 3, mask: 0x80, needsShift: false, isMeta: false}],
  ['t', { row: 4, mask: 0x10, needsShift: false, isMeta: false}],
  ['u', { row: 4, mask: 0x04, needsShift: false, isMeta: false}],
  ['v', { row: 2, mask: 0x20, needsShift: false, isMeta: false}],
  ['w', { row: 4, mask: 0x80, needsShift: false, isMeta: false}],
  ['x', { row: 2, mask: 0x80, needsShift: false, isMeta: false}],
  ['y', { row: 4, mask: 0x08, needsShift: false, isMeta: false}],
  ['z', { row: 1, mask: 0x20, needsShift: false, isMeta: false}],

  ['A', { row: 1, mask: 0x40, needsShift: false, isMeta: false}],
  ['B', { row: 2, mask: 0x10, needsShift: false, isMeta: false}],
  ['C', { row: 2, mask: 0x40, needsShift: false, isMeta: false}],
  ['D', { row: 3, mask: 0x40, needsShift: false, isMeta: false}],
  ['E', { row: 4, mask: 0x40, needsShift: false, isMeta: false}],
  ['F', { row: 3, mask: 0x20, needsShift: false, isMeta: false}],
  ['G', { row: 3, mask: 0x10, needsShift: false, isMeta: false}],
  ['H', { row: 3, mask: 0x08, needsShift: false, isMeta: false}],
  ['I', { row: 4, mask: 0x02, needsShift: false, isMeta: false}],
  ['J', { row: 3, mask: 0x04, needsShift: false, isMeta: false}],
  ['K', { row: 3, mask: 0x02, needsShift: false, isMeta: false}],
  ['L', { row: 5, mask: 0x40, needsShift: false, isMeta: false}],
  ['M', { row: 2, mask: 0x04, needsShift: false, isMeta: false}],
  ['N', { row: 2, mask: 0x08, needsShift: false, isMeta: false}],
  ['O', { row: 5, mask: 0x20, needsShift: false, isMeta: false}],
  ['P', { row: 1, mask: 0x02, needsShift: false, isMeta: false}],
  ['Q', { row: 1, mask: 0x80, needsShift: false, isMeta: false}],
  ['R', { row: 4, mask: 0x20, needsShift: false, isMeta: false}],
  ['S', { row: 3, mask: 0x80, needsShift: false, isMeta: false}],
  ['T', { row: 4, mask: 0x10, needsShift: false, isMeta: false}],
  ['U', { row: 4, mask: 0x04, needsShift: false, isMeta: false}],
  ['V', { row: 2, mask: 0x20, needsShift: false, isMeta: false}],
  ['W', { row: 4, mask: 0x80, needsShift: false, isMeta: false}],
  ['X', { row: 2, mask: 0x80, needsShift: false, isMeta: false}],
  ['Y', { row: 4, mask: 0x08, needsShift: false, isMeta: false}],
  ['Z', { row: 1, mask: 0x20, needsShift: false, isMeta: false}],

  // digits
  ['1', { row: 7, mask: 0x80, needsShift: false, isMeta: false}],
  ['2', { row: 7, mask: 0x40, needsShift: false, isMeta: false}],
  ['3', { row: 7, mask: 0x20, needsShift: false, isMeta: false}],
  ['4', { row: 7, mask: 0x10, needsShift: false, isMeta: false}],
  ['5', { row: 7, mask: 0x08, needsShift: false, isMeta: false}],
  ['6', { row: 7, mask: 0x04, needsShift: false, isMeta: false}],
  ['7', { row: 7, mask: 0x02, needsShift: false, isMeta: false}],
  ['8', { row: 6, mask: 0x80, needsShift: false, isMeta: false}],
  ['9', { row: 6, mask: 0x40, needsShift: false, isMeta: false}],
  ['0', { row: 6, mask: 0x20, needsShift: false, isMeta: false}],

  // puncuation
  ['!', { row: 7, mask: 0x80, needsShift: true, isMeta: false}],
  ['"', { row: 7, mask: 0x40, needsShift: true, isMeta: false}],
  ['#', { row: 7, mask: 0x20, needsShift: true, isMeta: false}],
  ['$', { row: 7, mask: 0x10, needsShift: true, isMeta: false}],
  ['%', { row: 7, mask: 0x08, needsShift: true, isMeta: false}],
  ['&', { row: 7, mask: 0x04, needsShift: true, isMeta: false}],
  ["'", { row: 7, mask: 0x02, needsShift: true, isMeta: false}],
  ['(', { row: 6, mask: 0x80, needsShift: true, isMeta: false}],
  [')', { row: 6, mask: 0x40, needsShift: true, isMeta: false}],

  [':', { row: 6, mask: 0x10, needsShift: false, isMeta: false}],
  ['*', { row: 6, mask: 0x10, needsShift: true, isMeta: false}],
  ['-', { row: 6, mask: 0x08, needsShift: false, isMeta: false}],
  ['=', { row: 6, mask: 0x08, needsShift: true, isMeta: false}],
  [';', { row: 1, mask: 0x04, needsShift: false, isMeta: false}],
  ['+', { row: 1, mask: 0x04, needsShift: true, isMeta: false}],
  [',', { row: 2, mask: 0x02, needsShift: false, isMeta: false}],
  ['<', { row: 2, mask: 0x02, needsShift: true, isMeta: false}],
  ['.', { row: 5, mask: 0x80, needsShift: false, isMeta: false}],
  ['>', { row: 5, mask: 0x80, needsShift: true, isMeta: false}],
  ['/', { row: 1, mask: 0x08, needsShift: false, isMeta: false}],
  ['?', { row: 1, mask: 0x08, needsShift: true, isMeta: false}],

  // specials
  [' ', { row: 1, mask: 0x10, needsShift: false, isMeta: false}],
  ['Backspace', { row: 6, mask: 0x04, needsShift: false, isMeta: false}],
  ['Escape', { row: 0, mask: 0x20, needsShift: false, isMeta: false}],
  ['Enter', { row: 5, mask: 0x08, needsShift: false, isMeta: false}],
]);

const LEFT_SHIFT_ROW: number = 0;
const LEFT_SHIFT_MASK: number = 0x04;
const KBD_ROWS: number = 8;

export default class Keyboard {
  _downMeta: Set<string>;
  _downKey: ?string;
  _rows: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
  _rowMask: number = 0;

  constructor() {
    document.addEventListener('keydown', (e: KeyboardEvent) => this._handleKeyboardEvent(e));
    document.addEventListener('keyup', (e: KeyboardEvent) => this._handleKeyboardEvent(e));

    this._downMeta = new Set(['CapsLock']);
    this._downKey = null;
  }

  writeByte(value: number): void {
    this._rowMask = value;
  }

  readByte(): number {
    let value = 0;

    for (let i = 0; i < KBD_ROWS; i++) {
      if ((this._rowMask & (1 << i)) !== 0) {
        value |= this._rows[i];
      }
    }

    return value;
  }

  _handleKeyboardEvent(event: KeyboardEvent): void {
    const key = event.key;
    const entry = keymap.get(key);

    if (entry == null) {
      return;
    }

    if (event.type === 'keydown') {
      if (entry.isMeta) {
        this._downMeta.add(key);
      } else {
        this._downKey = key;
      }
    } else {
      if (entry.isMeta) {
        this._downMeta.delete(key);
      } else if (key === this._downKey) {
        this._downKey = null;
      }
    }

    this._rebuildRows();
  }

  _rebuildRows(): void {
    this._rows = [0, 0, 0, 0, 0, 0, 0, 0];

    // turn on active metas
    for (const key of this._downMeta) {
      const meta = keymap.get(key);
      invariant(meta != null);
      this._rows[meta.row] |= meta.mask;
    }

    // turn on any down key
    if (this._downKey != null) {
      const entry = keymap.get(this._downKey);
      invariant(entry != null);

      this._rows[entry.row] |= entry.mask;

      // if we need a shift to generate this character, apply it.
      if (entry.needsShift) {
        this._rows[LEFT_SHIFT_ROW] |= LEFT_SHIFT_MASK;
      }
    }

    console.log('rows ' + this._rows.map(_ => _.toString(16)).join(','));
  }
}
