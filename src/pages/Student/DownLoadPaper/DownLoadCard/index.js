import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { showTime } from '@/utils/timeHandle';
import styles from '../index.less';

export default class Card extends PureComponent {
  render() {
    const { item } = this.props;
    return (
      <div className={styles.card}>
        <div className={styles.card_title}>{item.name}</div>
        <div className={styles.mainTime}>
          <div>
            <span className={styles.fullMark}>{item.fullMark || 100}</span>
            <span className={styles.black}>
              {formatMessage({ id: 'task.text.score.num', defaultMessage: '分' })}
            </span>
          </div>
          <div className={styles.card_content}>
            <div className={styles.card_btn}>
              {item.questionPointCount || 0}{' '}
              {formatMessage({ id: 'task.text.xiaoti', defaultMessage: '小题' })}
            </div>
            <div className={styles.card_btn}>{showTime(item.paperTime, 's')}</div>
          </div>
        </div>
      </div>
    );
  }
}
