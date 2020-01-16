import { Icon } from 'antd';
import React, { Component } from 'react';

class PlayButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isplaying: false,
    };
  }
  onclick = () => {
    this.setState({
      isplaying: !this.state.isplaying,
    });
    this.props.onPlayChange(this.state.isplaying);
  };
  render() {
    return (
      <div className="mediatool-playbutton" onClick={this.onclick}>
        <Icon type={this.state.isplaying ? 'pause' : 'right'} />
      </div>
    );
  }
}
export default PlayButton;
