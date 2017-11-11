import Emulator from './Emulator';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Screen from './Screen';

type Props = {
};

type State = {
  loading: boolean;
   vram: Uint8Array;
};

class App extends Component<Props, State> {
  _emulator: Emulator;

  constructor() {
    super();
    this._emulator = new Emulator(this);
  }

  componentWillMount() {
    this.setState({
      loading: true,
      vram: this._emulator.getVRAM(),
    })
    this._emulator.load().then(_ => {
      this.setState({
        loading: false
      })
    });
  }

  screenChanged() {
    this.setState({
      // $TODO would be nice to not copy this
      vram: this._emulator.getVRAM(),
    });
  }

  render() {
    if (this.state.loading) {
      return <div>Loading...</div>;
    }
    return <div><Screen vram={this.state.vram}/></div>;
  }
}

export default App;

let root = document.getElementById('root');
if (root) {
  ReactDOM.render(<App/>, root);
}
