/* eslint-disable eqeqeq */
import React, { PureComponent } from 'react';
import styles from './index.less';

/*
    获取图片组件

 */

export default class StemImage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      audioUrl: '',
    };
  }

  componentDidMount() {
    const { id, url } = this.props;
    if (url == undefined) {
      const self = this;

      if (id) {
        const imgUrl = `/proxyapi/proxy/file/assets?id=${id}&key=${localStorage.getItem(
          'access_token'
        )}`;
        self.setState({
          audioUrl: imgUrl,
        });
      }
    }
  }

  render() {
    const { audioUrl } = this.state;

    const { className, style, customStyle } = this.props;

    return (
      <div className={styles.flex} style={customStyle}>
        <div>
          <img style={style} src={audioUrl} className={`${styles.stemImage} ${className}`} alt="" />
        </div>
      </div>
    );
  }
}
