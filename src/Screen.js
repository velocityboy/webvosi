// @flow

import React, {Component} from 'react';

type Props = {
  vram: Uint8Array,
};

type State = {};

export default class Screen extends Component<Props, State> {
  lines() {
    const l = [];
    for (let i = 0; i < 32; i++) {
      let line = '';
      for (let j = 0; j < 64; j++) {
        let byte = this.props.vram[i*64+j] & 0x7F;
        if (byte < 32) {
          byte = 32;
        }
        if (byte == 32) {
          line += "\u00A0";
        } else {
          line += String.fromCharCode(byte);
        }
      }
      l.push(
        <div key={i}>{line}</div>
      );
    }

    return l;
  }

  render() {
    return (
      <div className="screen">
      {this.lines()}
      </div>
    );
  }
}
