/* eslint-disable no-undef */
import React, { PureComponent } from 'react';
import styles from './index.less';
import IconButton from '@/frontlib/components/IconButton';
import { playStudentFile } from '@/utils/instructions';
import emitter from '@/utils/ev';

/*
    播放组件

/*
  播放组件
  * @Author   tina.zhang
  * @DateTime  2018-10-17
  * @param     {[type]}    id            音频id
  * @param     {[type]}    url           音频路径
  * @param     {[type]}    focusId       当前播放音频Id
  * @param     {[type]}    focus         音频焦点
  * @param     {[type]}    token_id      我的录音id
  * @param     {[type]}    callback      回调函数
  * hiddenRecordAnswer=="online" 用于报告页的录音回放，如果是线上平台采用下载文件的方式，如果是考中采用音频流的方式
 */
export default class AutoPlay extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isPlay: false,
    };
  }

  componentWillMount() {
    const self = this;
    emitter.addListener('stopplayStudentFile', x => {
      const { tokenId } = self.props;
      console.log(x);
      if (x.tokenId === tokenId) {
        return;
      }
      vb.getPlayerManager().stop();
      this.setState({ isPlay: false });
    });
  }

  componentWillUnmount() {
    vb.getPlayerManager().stop();
    this.setState({ isPlay: false });
  }

  start = () => {
    const { isPlay } = this.state;
    const { tokenId, url } = this.props;
    this.setState({ isPlay: !isPlay });
    emitter.emit('stopplayStudentFile', { tokenId });
    setTimeout(() => {
      if (isPlay) {
        vb.getPlayerManager().stop();
        this.setState({ isPlay: false });
      } else {
        // console.log(tokenId);
        playStudentFile({
          tokenId,
          url,
          success: () => {
            this.setState({ isPlay: false });
          },
          error: () => {
            this.setState({ isPlay: false });
          },
        });
      }
    }, 500);
  };

  render() {
    const { isPlay } = this.state;
    const { tokenId } = this.props;
    // 我的录音
    if (tokenId) {
      return (
        <div className={`${styles.addquestion_audio} myAudio`}>
          <IconButton
            iconName="icon-wave"
            className={isPlay ? styles.play : styles.myIcon}
            onClick={this.start}
          />
        </div>
      );
    }
    return (
      <div className={`${styles.addquestion_audios} myAudio`}>
        <i className={`iconfont icon-wave ${styles.myIcon}`} />
        {/* <IconButton iconName="icon-wave" className={styles.myIcon} /> */}
      </div>
    );
  }
}
