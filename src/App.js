import Emulator from './Emulator';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

type Props = {
};

type State = {
  loading: boolean;
};

class App extends Component<Props, State> {
  _emulator: Emulator;

  constructor() {
    super();
    this._emulator = new Emulator();
  }

  componentWillMount() {
    this.setState({
      loading: true
    })
    this._emulator.load().then(_ => {
      this.setState({
        loading: false
      })
    });
  }

  render() {
    if (this.state.loading) {
      return <div>Loading...</div>;
    }
    return <div>done loading</div>;
  }
}

export default App;

let root = document.getElementById('root');
if (root) {
  ReactDOM.render(<App/>, root);
}
