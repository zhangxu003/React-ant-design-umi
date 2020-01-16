import { Icon } from 'antd';
import React, { Component } from 'react';

class CutButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isCuting: false,
    };
  }
  onclick = () => {
    this.props.onCutChange(!this.state.isCuting);
    this.setState({
      isCuting: !this.state.isCuting,
    });
  };
  render() {
    return (
      <div className="mediatool-cutbutton" onClick={this.onclick}>
        <Icon type={this.state.isCuting ? 'stop' : 'scissor'} />
      </div>
    );
  }
}
export default CutButton;
