/*
 * @Author: tina.zhang
 * @Date: 2018-12-20 18:51:41
 * @LastEditors: jeffery.shi
 * @LastEditTime: 2019-05-06 14:53:34
 * @Description: 任务列表-任务监控-异常处理相关页面（练习的异常处理）
 */

import React, { Component } from 'react';
import { Button, Divider, Tooltip, Icon } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import cs from 'classnames';
import styles from './index.less';
import { sendMS } from '@/utils/instructions';
import { delay } from '@/utils/utils';
import { showTime } from '@/utils/timeHandle';

const handleSecond = time => showTime(time, 's');

@connect(({ popup, task }) => {
  const sid = popup.practiceExceptionHandle && popup.practiceExceptionHandle.data;
  const { connId, paperList = [] } = task.students.find(item => item.studentId === sid) || {};
  // 只显示 上传失败  和 上传中的试卷
  const showList = paperList.filter(
    item => item.respondentsStatus === 'loading' || item.respondentsStatus === 'RS_4'
  );
  return {
    connId,
    showList, // 页面显示的相关列表
    paperList, // 全部的试卷列表
    sid,
    loading: paperList.some(item => item.respondentsStatus === 'loading'), // 是否有试卷正在处理中，如果是，则重新交卷和 导入答案包都将无效
  };
})
class PracticeExceptionHanding extends Component {
  // 收取答卷包的次数
  reGetAnswerPackNum = 0;

  componentDidUpdate(preProps) {
    // 当全部完成时，弹框关闭。
    const { showList, dispatch, sid } = this.props;
    const { showList: preShowList } = preProps;
    if (showList.length !== preShowList.length && showList.length === 0) {
      dispatch({
        type: 'task/updateStudentWatchData',
        payload: {
          studentId: sid,
          accessFlag: 'manual', // 手动处理的内容
        },
      });
      dispatch({
        type: 'popup/close',
        payload: 'practiceExceptionHandle',
      });
    }
  }

  /**
   * @description: 点击重新收取答案包
   * @param {type}
   * @return:
   */
  reGetAnswerPack = async () => {
    const { connId, dispatch, sid, paperList } = this.props;
    // 将paperList中，上传失败的试卷设置为loading状态，代码上传中
    dispatch({
      type: 'task/updateStudentWatchData',
      payload: {
        studentId: sid,
        paperList: paperList.map(tag => ({
          ...tag,
          respondentsStatus: tag.respondentsStatus === 'RS_4' ? 'loading' : tag.respondentsStatus,
        })),
      },
    });
    sendMS('recycle', {}, connId);
    this.reGetAnswerPackNum += 1;
    await delay(10000);

    // 十秒以后再次进行判断，如果respondentsStatus === "loading" 则改为 RS_2
    const { paperList: paperListNew, loading } = this.props;
    if (loading) {
      dispatch({
        type: 'task/updateStudentWatchData',
        payload: {
          studentId: sid,
          paperList: paperListNew.map(tag => ({
            ...tag,
            respondentsStatus: tag.respondentsStatus === 'loading' ? 'RS_4' : tag.respondentsStatus,
          })),
        },
      });
    }
  };

  /**
   * @description: 导入答案包
   * @param {type}
   * @return:
   */
  importAnswerPack = snapshotId => {
    const { sid, dispatch } = this.props;
    dispatch({
      type: 'vbClient/importAnswerPack',
      payload: {
        sid,
        snapshotId,
      },
    });
  };

  /**
   * @description: 异常处理中试卷列表
   * @param {type}
   * @return:
   */
  tableRender = () => {
    const { showList } = this.props;
    return (
      <div className={styles.content}>
        <ul className={styles.list}>
          {showList.map(item => (
            <li
              key={item.snapshotId}
              style={{ backgroundSize: `${item.uploadProcess || 0}% 100%` }}
            >
              <div className={styles.title}>{item.paperName}</div>
              <div className={styles.info}>
                <span>
                  <span className={styles.label || 0}>
                    {formatMessage({
                      id: 'task.examination.inspect.task.detail.full.mark',
                      defaultMessage: '总分',
                    })}
                  </span>
                  ：{item.fullMark}
                  {formatMessage({ id: 'task.text.score.num', defaultMessage: '分' })}
                </span>
                <Divider type="vertical" />
                {/*
                  vb-8528 考中平台题目数文案调整--教师端（直接在SIT调整）
                  <span>
                    <span className={styles.label}>
                      {formatMessage({id:"task.text.question.number",defaultMessage:"题目数"})}
                    </span>：
                    {item.questionPointCount||0}{formatMessage({id:"task.text.ti",defaultMessage:"题"})}
                  </span>
                  <Divider type="vertical" /> */}
                <span>
                  <span className={styles.label}>
                    {formatMessage({ id: 'task.text.total.time', defaultMessage: '总时长' })}
                  </span>
                  ：{handleSecond(item.paperTime)}
                </span>
              </div>
              <div className={styles.options}>
                <div className={styles.warn}>
                  {formatMessage({ id: 'task.title.Lackofanswers', defaultMessage: '答卷缺失' })}
                </div>
                {item.respondentsStatus === 'loading' ? (
                  <Icon type="loading" />
                ) : (
                  <Tooltip
                    title={formatMessage({
                      id: 'task.message.import.answer',
                      defaultMessage: '导入答卷包',
                    })}
                  >
                    <span
                      onClick={() => this.importAnswerPack(item.snapshotId)}
                      className={cs('iconfont icon-upload', styles.upload)}
                    />
                  </Tooltip>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  render() {
    const { loading } = this.props;
    return (
      <div className={styles.exceptionHanding}>
        {this.tableRender()}
        <Button
          className={styles.big}
          loading={loading}
          style={{ marginTop: '10px' }}
          onClick={this.reGetAnswerPack}
        >
          {formatMessage({ id: 'task.button.push.paper.again', defaultMessage: '重新交卷' })}
        </Button>
        {this.reGetAnswerPackNum > 3 || (this.reGetAnswerPackNum === 3 && !loading) ? (
          <p className={styles.warning}>
            <i className="iconfont icon-warning" />
            {formatMessage({
              id: 'task.text.manual.import.answer',
              defaultMessage: '已连续三次收取失败，建议手动导入答卷包！',
            })}
          </p>
        ) : null}
        {/* <Button className={styles.big} loading={loading} style={{marginTop:"10px"}} onClick={this.importAnswerPack}>导入答卷包</Button> */}
      </div>
    );
  }
}

export default PracticeExceptionHanding;
