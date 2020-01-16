/* eslint-disable consistent-return */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Tooltip } from 'antd';
import { formatMessage } from 'umi/locale';
import Styles from './index.less';
import AutoPlayer from './AutoPlayer';

@connect(({ paperEvaluation }) => ({
  answerList: paperEvaluation.answerList,
  snapshotId: paperEvaluation.snapshotId,
  taskId: paperEvaluation.taskId,
}))
class AnswerResult extends Component {
  componentWillMount() {}

  switchType = key => {
    switch (key) {
      case '1.0':
        return formatMessage({ id: 'task.text.bad', defaultMessage: '差' });
      case '2.0':
        return formatMessage({ id: 'task.text.middle', defaultMessage: '中' });
      case '3.0':
        return formatMessage({ id: 'task.text.liang', defaultMessage: '良' });
      case '4.0':
        return formatMessage({ id: 'task.text.good', defaultMessage: '优' });
      default:
        break;
    }
  };

  renderContent = type => {
    const { answerList, taskId, snapshotId } = this.props;
    let JSX = null;
    if (type === 'CHOICE') {
      JSX = answerList.map(item => (
        <div className={Styles.titles}>
          <div className={Styles.flex}>
            <Tooltip placement="right" title={item.className}>
              <span>{item.studentName}</span>
            </Tooltip>
            <span>{item.score}分</span>
          </div>
          <div style={{ marginTop: '5px' }}>
            <span>
              {item.studentAnswers === 'server.wzd'
                ? formatMessage({ id: 'task.text.wzd', defaultMessage: '未答题' })
                : item.studentAnswers}
            </span>
          </div>
        </div>
      ));
      return JSX;
    }

    if (type === 'GAP_FILLING') {
      JSX = answerList.map(item => (
        <div className={Styles.titles}>
          <div className={Styles.flex}>
            <Tooltip placement="right" title={item.className}>
              <span>{item.studentName}</span>
            </Tooltip>
            <span>{item.score}分</span>
          </div>
          <div style={{ marginTop: '5px' }}>
            <span>
              {item.studentAnswers === 'server.wzd'
                ? formatMessage({ id: 'task.text.wzd', defaultMessage: '未答题' })
                : item.studentAnswers}
            </span>
          </div>
        </div>
      ));
      return JSX;
    }

    JSX = answerList.map(item => (
      <div className={Styles.titles}>
        <div className={Styles.flex}>
          <Tooltip placement="right" title={item.className}>
            <span>{item.studentName}</span>
          </Tooltip>
          <div className={Styles.flex}>
            <span>{item.score}分</span>&nbsp;&nbsp;
            <AutoPlayer
              key={item.tokenId}
              tokenId={item.tokenId}
              url={`exercisefile/${taskId}/${item.studentId}/${snapshotId}/${item.tokenId}`}
            />
          </div>
        </div>
        {this.switchType(item.pronunciation) &&
          this.switchType(item.integrity) &&
          this.switchType(item.fluency) && (
            <div className={Styles.flex} style={{ marginTop: '5px' }}>
              <div className={Styles.text_center}>
                <div>
                  {formatMessage({ id: 'task.text.pronunciationStatis', defaultMessage: '发音' })}
                </div>
                <div>{this.switchType(item.pronunciation)}</div>
              </div>
              <div className={Styles.text_center}>
                <div>
                  {formatMessage({ id: 'task.text.integrityStatis', defaultMessage: '完整度' })}
                </div>
                <div>{this.switchType(item.integrity)}</div>
              </div>
              <div className={Styles.text_center}>
                <div>
                  {formatMessage({ id: 'task.text.fluencyStatis', defaultMessage: '流利度' })}
                </div>
                <div>{this.switchType(item.fluency)}</div>
              </div>
            </div>
          )}
      </div>
    ));
    return JSX;
  };

  render() {
    const { answerList } = this.props;
    let type = '';
    if (answerList[0]) {
      type = answerList[0].answerType;
    } else {
      return (
        <div className={Styles.none}>
          <i className="iconfont icon-tip" />
          <div className={Styles.noneTips}>
            {formatMessage({ id: 'task.title.nodata', defaultMessage: '暂无数据' })}
          </div>
        </div>
      );
    }
    return (
      <div className={Styles.bizcharts}>
        <div className={Styles.rightcontent}>{this.renderContent(type)}</div>
      </div>
    );
  }
}

export default AnswerResult;
