import React from 'react';
import { Divider, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import styles from './index.less';
import iconPro from '@/assets/icon_pro.png';

/**
 * 考后报告-任务信息
 * @author tina.zhang
 * @date   2019-05-06
 * @param  {object} taskOverview - 任务信息总览
 * @param  {function} refreshReport - 刷新报告
 */
function TaskInfo(props) {
  const { taskOverview, refreshReport, onOpen, permission } = props;

  // 发布成绩
  const handleRefreshReport = () => {
    if (refreshReport && typeof refreshReport === 'function') {
      refreshReport();
    }
  };

  let classCount = 0;
  let paperCount = 0;
  if (taskOverview.classList) {
    classCount = taskOverview.classList.length;
  }
  if (taskOverview.paperList) {
    paperCount = taskOverview.paperList.length;
  }

  const formatClassCountLabel =
    taskOverview.classType !== 'LEARNING_GROUP'
      ? formatMessage({
          id: 'task.text.exercisereport.taskInfo.classCount',
          defaultMessage: '班级数量',
        })
      : formatMessage({
          id: 'task.text.exercisereport.taskInfo.groupCount',
          defaultMessage: '分组数量',
        });

  return (
    <div className={styles.taskInfo}>
      <div className={styles.title}>
        <span className={styles.taskName}>{taskOverview.taskName}</span>

        <Button className={styles.btn} shape="round" onClick={handleRefreshReport}>
          {formatMessage({
            id: 'task.button.exercisereport.taskInfo.refreshBtn',
            defaultMessage: '刷新',
          })}
        </Button>

        <Button className={styles.yellowbtn} shape="round" onClick={onOpen}>
          {formatMessage({ id: 'task.text.papercommenting', defaultMessage: '试卷讲评' })}
          {permission && !permission.V_ANSWER_DETAIL && (
            <img src={iconPro} alt="" className={styles.img} />
          )}
        </Button>
      </div>
      <div className={styles.content}>
        <span>
          {formatClassCountLabel}：{classCount}
        </span>{' '}
        <Divider type="vertical" />
        <span>
          {formatMessage({
            id: 'task.text.exercisereport.taskInfo.paperCount',
            defaultMessage: '试卷数量',
          })}
          ：{paperCount}
        </span>
        {/* 隐藏 实练人数 from Rocky 2019-9-9 09:15:47 */}
        {/* <Divider type="vertical" /> <span>{formatMessage({id:"task.text.exercisereport.taskInfo.examStudentNum",defaultMessage:"实练/应练"})}：{`${taskOverview.examNum}/${taskOverview.studentNum}`}人</span> */}
      </div>
      <Divider type="horizontal" />
    </div>
  );
}

export default TaskInfo;
