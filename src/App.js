import React, {Component} from 'react';
import ReactDOM from 'react-dom';

type Props = {
};

type State = {
};

class App extends Component<Props, State> {
  render() {
    return (
      <div>Emulator goes here</div>
    );
  }
}

export default App;

let root = document.getElementById('root');
if (root) {
  ReactDOM.render(<App/>, root);
}
