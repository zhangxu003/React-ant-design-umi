/* eslint-disable no-shadow */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import React, { PureComponent } from 'react';
import styles from './index.less';
import { fetchPaperFileUrl } from '@/services/api';
import { formatMessage } from 'umi/locale';
import emitter from '@/utils/ev';

/*
    获取图片组件

 */

export default class StemVideo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      audioUrl: '',
      isPlay: false,
    };
  }

  componentDidMount() {
    const { id, url } = this.props;
    const self = this;
    if (url == undefined) {
      const accessToken = localStorage.getItem('access_token');
      this.setState(
        {
          audioUrl: `/proxyapi/proxy/file/assets?id=${id}&key=${accessToken}`,
        },
        () => {
          this.onload();
        }
      );
    }

    emitter.addListener('stopPromptSound', x => {
      if (self.videoValue) {
        self.videoValue.pause();
      }
    });

    emitter.addListener('startRecord', x => {
      // if(x === true){
      if (self.videoValue) {
        self.videoValue.pause();
      }
      // }
    });
  }

  onload = () => {
    const { callback } = this.props;
    if (this.videoValue) {
      this.videoValue.oncontextmenu = () => false;

      this.videoValue.addEventListener('play', () => {
        callback(this.randomId);
      });

      this.videoValue.addEventListener('ended', () => {});
    }
  };

  render() {
    const { isPlay, audioUrl } = this.state;

    const { type, className, style, customStyle } = this.props;
    return (
      <div className={styles.flex} style={customStyle}>
        {audioUrl && (
          <div>
            <video
              src={audioUrl}
              ref={video => {
                this.videoValue = video;
              }}
              controls="controls"
              controlslist="nodownload"
              style={style}
            >
              {formatMessage({
                id: 'app.text.videotip',
                defaultMessage: '您的浏览器不支持播放该视频！',
              })}
            </video>
          </div>
        )}
      </div>
    );
  }
}
