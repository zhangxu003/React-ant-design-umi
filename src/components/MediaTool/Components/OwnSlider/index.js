import { Slider } from 'antd';
import React, { Component } from 'react';

class OwnSlider extends Component {
  constructor(props) {
    super(props);
    this.hasRanged = false;
    this.state = {
      value: 0,
      rangevalue: [0, 1],
    };
  }
  componentWillReceiveProps = props => {
    if (!this.hasRanged) {
      this.setState({
        value: props.value,
        rangevalue: props.rangevalue,
      });
    } else {
      this.setState({
        value: props.value,
      });
    }
  };
  onChange = v => {
    this.props.ontouch(true, v);
    this.setState({
      value: v,
    });
  };
  onAfterChange = v => {
    this.props.ontouch(false, v);
  };
  onRangeChange = data => {
    this.hasRanged = true;
    this.props.oncut(data);
    this.setState({
      rangevalue: data,
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
    const { max, isCuting } = this.props;
    return (
      <div>
        <div className="mediatool-ownslider">
          <Slider
            defaultValue={0}
            value={this.state.value}
            max={max}
            onChange={this.onChange}
            onAfterChange={this.onAfterChange}
            tipFormatter={this.countTime}
          />
        </div>
        <div className="mediatool-cutslider" style={{ display: isCuting ? 'block' : 'none' }}>
          <Slider
            range
            defaultValue={[0, 5]}
            max={max}
            value={this.state.rangevalue}
            onChange={this.onRangeChange}
            tipFormatter={this.countTime}
          />
        </div>
      </div>
    );
  }
}
export default OwnSlider;
