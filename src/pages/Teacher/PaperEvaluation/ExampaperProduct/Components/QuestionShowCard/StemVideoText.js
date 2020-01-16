import React, { PureComponent } from 'react';
import IconButton from '@/frontlib/components/IconButton';
import AudioTextModal from '@/frontlib/components/ExampaperProduct/Components/AutoPlay/AudioTextModal/api';
import styles from '@/frontlib/components/ExampaperProduct/Components/AutoPlay/index.less';
import { formatMessage } from 'umi/locale';

/**
  视频原文组件
  * @Author   tina.zhang
  * @DateTime  2018-10-17
 */
export default class AutoPlay extends PureComponent {
  render() {
    const { className, text, style } = this.props;

    return (
      <div className={`${styles.addquestion_audio} myAudio ${className}`} style={style}>
        <IconButton
          iconName="icon-text"
          className={styles.myIcon}
          onClick={() => {
            AudioTextModal({
              dataSource: text,
              title: formatMessage({ id: 'app.text.spyw', defaultMessage: '视频原文' }),
              callback: () => {},
            });
          }}
        />
      </div>
    );
  }
}
