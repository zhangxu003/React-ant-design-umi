import { Slider, Icon } from 'antd';
import React, { Component } from 'react';
import './index.less';
import OwnSlider from './Components/OwnSlider';
import AudioTimer from './Components/AudioTimer';
import IconButton from '@/components/IconButton';
import RateButton from './Components/RateButton';
import { func } from 'prop-types';

/**
 * 支持区间播放的音频播放器
 *
 *  @Author: tina.zhang.xu
 */

class MediaTool extends Component {
  constructor(props) {
    super(props);
    this.audio = document.createElement('audio');
    this.timer; //定时器
    this.onTiming = false; //定是中
    this.startTime = 0; //区间开始时间
    this.endTime = 0; //区间结束时间
    this.hasCuted = false; //裁剪过判断
    this.rate = 1.0; //音频播放速度，默认原速

    this.state = {
      timeNow: 0, //播放器当前时间
      max: 100,
      value: 0,
      isCuting: false,
      sep: [],
      isPlay: false,
    };
  }
  componentWillUnmount() {
    this.stop();
  }

  //加载音频
  componentDidMount = () => {
    const { audioSrc } = this.props;
    this.audio.src = audioSrc;
    this.audio.onloadeddata = () => {
      this.setState({
        max: this.audio.duration,
      });
      this.play();
    };
  };
  //点击播放按钮
  playButtonChange() {
    const { isPlay } = this.state;
    isPlay ? this.stop() : this.play();
  }
  //点击裁剪按钮
  cutButtonChange() {
    const { isCuting } = this.state;
    let s = 0,
      e;
    this.setState({
      isCuting: !isCuting,
    });
    //提供区间初始值
    if (this.endTime == 0) {
      if (this.audio.currentTime - 2 > 0) {
        s = this.audio.currentTime - 2;
      }
      if (this.audio.currentTime + 10 < this.state.max) {
        e = this.audio.currentTime + 10;
      } else {
        e = this.state.max;
      }
      this.setState({
        sep: [s, e],
      });
    }
  }
  //裁剪区间变化
  onCutTimeChange = e => {
    this.hasCuted = true;
    this.startTime = e[0];
    this.endTime = e[1];
  };
  //播放
  play = () => {
    console.log('play');
    console.log(this.audio.src);
    if (this.state.isCuting) {
      this.audio.currentTime = this.startTime;
    }
    this.audio.play();
    this.setState({ isPlay: true });
    this.timer = setInterval(this.getCurrentTime, 200);
    this.onTiming = true;
  };

  stop = () => {
    this.audio.pause();
    this.setState({ isPlay: false });
    clearInterval(this.timer);
    this.onTiming = false;
  };
  getCurrentTime = () => {
    if (this.state.isPlay) {
      if (this.state.isCuting) {
        if (
          this.hasCuted &&
          (this.audio.currentTime > this.endTime || this.audio.currentTime < this.startTime)
        ) {
          this.audio.currentTime = this.startTime;
        }
      }
      this.setState({
        timeNow: this.audio.currentTime,
        value: this.audio.currentTime,
      });
      if (this.audio.ended) {
        this.stop();
      }
    }
  };
  ontouchChange = (a, v) => {
    if (a) {
      if (this.onTiming) {
        clearInterval(this.timer);
        this.onTiming = false;
      }
    } else {
      this.audio.currentTime = v;
      if (!this.onTiming) {
        this.setState({
          value: v,
        });
        this.timer = setInterval(this.getCurrentTime, 200);
        this.onTiming = true;
      }
    }
  };

  onRateChange = a => {
    switch (a) {
      case 'normal':
        this.rate = 1.0;
        break;
      case 'slow':
        this.rate = 0.8;
        break;
      case 'slower':
        this.rate = 0.6;
        break;
    }
    this.audio.playbackRate = this.rate;
  };

  render() {
    return (
      <div className="mediatool">
        <OwnSlider
          value={this.state.value}
          rangevalue={this.state.sep}
          max={this.state.max}
          ontouch={this.ontouchChange}
          oncut={this.onCutTimeChange}
          isCuting={this.state.isCuting}
        />
        <AudioTimer timeNow={this.state.timeNow} />
        <IconButton
          iconName={this.state.isPlay ? 'icon-v-pause' : 'icon-v-play'}
          className="mediatool-playbutton"
          onClick={this.playButtonChange.bind(this)}
        />
        <IconButton
          iconName={this.state.isCuting ? 'icon-play-between-close' : 'icon-play-between'}
          className="mediatool-cutbutton"
          onClick={this.cutButtonChange.bind(this)}
        />
        <RateButton onRateChange={this.onRateChange} />
      </div>
    );
  }
}

export default MediaTool;
