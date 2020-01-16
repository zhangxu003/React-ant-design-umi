/**
 * 显示 练习 试卷数量 的弹出框
 */
import React from 'react';
import { Divider } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import styles from './index.less';
import cornerLess from '@/assets/corner_less_icon.png';
import { showTime } from '@/utils/timeHandle';

@connect(({ dictionary }) => ({
  RESPONDENTSSTATUS: dictionary.RESPONDENTSSTATUS || [],
}))
class ShowPaperList extends React.PureComponent {
  renderRespondentStatus = respondentsStatus => {
    const { RESPONDENTSSTATUS } = this.props;
    const { value } = RESPONDENTSSTATUS.find(item => item.code === respondentsStatus) || {};
    if (
      respondentsStatus === 'RS_2' ||
      respondentsStatus === 'RS_3' ||
      respondentsStatus === 'RS_4'
    ) {
      return (
        <div className={styles.lose}>
          <img src={cornerLess} alt="答题缺失" />
        </div>
      );
    }

    return (
      <div className={styles.success}>
        <div className={styles.tag}>
          {formatMessage({ id: 'task.title.paperSucess', defaultMessage: '交卷成功' })}
        </div>
        {respondentsStatus !== 'RS_1' && (
          <div className={styles.warn}>
            <span className="iconfont icon-warning">{value}</span>
          </div>
        )}
      </div>
    );
  };

  render() {
    const { list } = this.props;
    const obj = list.reduce(
      (current, item) => {
        const { elapsedTime = 0, responseQuestionCount = 0, questionPointCount = 0 } = item;
        return {
          time: current.time + elapsedTime,
          size: current.size + responseQuestionCount,
          total: current.total + questionPointCount,
        };
      },
      {
        time: 0,
        size: 0,
        total: 0,
      }
    );

    return (
      <div className={styles.containers}>
        <div className={styles.total}>
          <span>
            {formatMessage(
              { id: 'task.message.total.time', defaultMessage: '总用时：{time}' },
              { time: showTime(obj.time, 'ms') }
            )}
          </span>
          <Divider type="vertical" />
          <span>
            {formatMessage(
              {
                id: 'task.message.current.finish.status',
                defaultMessage: '已做：{size}/{total}小题',
              },
              { size: obj.size, total: obj.total }
            )}
          </span>
        </div>
        <div className={styles.content}>
          <ul className={styles.list}>
            {list.map(item => (
              <li key={item.snapshotId}>
                <div className={styles.title}>{item.paperName}</div>
                <div className={styles.info}>
                  <span>
                    <span className={styles.label}>
                      {formatMessage({ id: 'task.title.use.time', defaultMessage: '用时' })}
                    </span>
                    ：{showTime(item.elapsedTime, 'ms')}
                  </span>
                  <Divider type="vertical" />
                  <span>
                    <span className={styles.label}>
                      {formatMessage({ id: 'task.text.has.finished', defaultMessage: '已做' })}
                    </span>
                    ：{item.responseQuestionCount || 0}/{item.questionPointCount || 0}
                    {formatMessage({ id: 'task.text.ti', defaultMessage: '小题' })}
                  </span>
                </div>
                {this.renderRespondentStatus(item.respondentsStatus)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default ShowPaperList;
