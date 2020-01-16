import React, { Component } from 'react';

class AudioTimer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showtime: '00:00',
    };
  }
  componentWillReceiveProps = props => {
    this.setState({
      showtime: this.countTime(props.timeNow),
    });
  };
  countTime = time => {
    //分钟
    let minute = time / 60;
    let minutes = parseInt(minute);
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    //秒
    let second = time % 60;
    let seconds = Math.round(second);
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    return minutes + ':' + seconds;
  };
  render() {
    return (
      <div className="mediatool-timer">
        <span>{this.state.showtime}</span>
      </div>
    );
  }
}
export default AudioTimer;
