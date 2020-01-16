/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-spread */
/* eslint-disable radix */
/* eslint-disable no-script-url */
import React, { useCallback, useMemo } from 'react';
import { Tooltip, Table } from 'antd';
import Dimensions from 'react-dimensions';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import styles from './index.less';
import { countDown } from '@/utils/timeHandle';

/**
 * 教师报告-成绩单
 * @author tina.zhang
 * @date   2019-07-03
 * @param {object} dataSource - 数据源
 * @param {number} classCount - 班级数量
 * @param {function} onPageChange - 分页事件
 * @param {function} onSortChange - 排序事件
 * @param {function} classType - 任务发布班级类型
 */
const TranscriptList = props => {
  const { dataSource, classCount, loading, onPageChange, onSortChange, classType } = props;

  const formatClassName =
    classType !== 'LEARNING_GROUP'
      ? formatMessage({
          id: 'task.text.exercisereport.transcript.table.className',
          defaultMessage: '班级',
        })
      : formatMessage({
          id: 'task.text.exercisereport.transcript.table.groupName',
          defaultMessage: '分组',
        });

  // 答题时长转换
  const formatDuration = useCallback((duration = 0) => {
    let time = duration;
    if (!duration || Number.isNaN(Number(duration))) {
      time = 0;
    }
    const seconds = Math.round(Number(time) / 1000); // 单位调整为毫秒
    return countDown(seconds);
  }, []);
  // #endregion

  // #region format columns
  const getColumns = useMemo(
    () => {
      // 未交卷
      const nullScore = (item, key) => {
        if (item.responseQuestionScore === null) {
          return <span>--</span>;
        }
        if (key === 'elapsedTime') {
          return <span>{formatDuration(item[key])}</span>;
        }
        return <span>{item[key]}</span>;
      };

      const sortDirections = ['descend', 'ascend'];
      const columns = [
        {
          title: (
            <span>
              {formatMessage({
                id: 'task.text.exercisereport.transcript.table.examNo',
                defaultMessage: '考号',
              })}
            </span>
          ),
          dataIndex: 'examNo',
          key: 'examNo',
          align: 'left',
          sorter: true,
          sortDirections,
        },
        {
          title: (
            <span>
              {formatMessage({
                id: 'task.text.exercisereport.transcript.table.studentName',
                defaultMessage: '姓名',
              })}
            </span>
          ),
          dataIndex: 'studentName',
          key: 'studentName',
          align: 'left',
          render: studentName => (
            <Tooltip title={studentName}>
              {studentName.length >= 8 ? `${studentName.slice(0, 4)}...` : studentName}
            </Tooltip>
          ),
        },
      ];

      // 多班显示班级列
      if (classCount > 1) {
        columns.push({
          title: <span>{formatClassName}</span>,
          dataIndex: 'className',
          key: 'className',
          align: 'left',
          sorter: true,
          sortDirections,
        });
      }
      columns.push(
        ...[
          {
            title: (
              <span>
                {formatMessage({
                  id: 'task.text.exercisereport.transcript.table.responseQuestionScore',
                  defaultMessage: '得分',
                })}
              </span>
            ),
            dataIndex: 'responseQuestionScore',
            key: 'responseQuestionScore',
            align: 'left',
            sorter: true,
            sortDirections,
            render: (responseQuestionScore, item) => nullScore(item, 'responseQuestionScore'),
          },
          {
            title: (
              <span>
                {formatMessage({
                  id: 'task.text.exercisereport.transcript.table.subjectScore',
                  defaultMessage: '主观题得分',
                })}
              </span>
            ),
            dataIndex: 'subjectScore',
            key: 'subjectScore',
            align: 'left',
            sorter: true,
            sortDirections,
            render: (subjectScore, item) => nullScore(item, 'subjectScore'),
          },
          {
            title: (
              <span>
                {formatMessage({
                  id: 'task.text.exercisereport.transcript.table.objectScore',
                  defaultMessage: '客观题得分',
                })}
              </span>
            ),
            dataIndex: 'objectScore',
            key: 'objectScore',
            align: 'left',
            sorter: true,
            sortDirections,
            render: (objectScore, item) => nullScore(item, 'objectScore'),
          },
          {
            title: (
              <span>
                {formatMessage({
                  id: 'task.text.exercisereport.transcript.table.elapsedTime',
                  defaultMessage: '答题时长',
                })}
              </span>
            ),
            dataIndex: 'elapsedTime',
            key: 'elapsedTime',
            align: 'left',
            sorter: true,
            sortDirections,
            render: (elapsedTime, item) => nullScore(item, 'elapsedTime'),
          },
        ]
      );
      columns.push({
        title: (
          <span>
            {formatMessage({ id: 'task.title.answer.status', defaultMessage: '答卷状态' })}
          </span>
        ),
        key: 'btngroup',
        align: 'left',
        render: item => {
          if (item.responseQuestionScore === null) {
            return (
              <span className={classnames(styles.btnGroups, styles.btnWarning)}>
                {formatMessage({
                  id: 'task.text.exercisereport.transcript.table.unAnswered',
                  defaultMessage: '未交卷',
                })}
              </span>
            );
          }
          // TODO
          // return (
          //   <span
          //     className={styles.btnGroups}
          //     onClick={() => {
          //       onOpen(item.studentId);
          //     }}
          //   >
          //     讲评
          //   </span>
          // );
          return (
            <span>
              {formatMessage({
                id: 'task.text.exercisereport.transcript.table.answered',
                defaultMessage: '已交卷',
              })}
            </span>
          );
        },
      });
      const tableWidth = window.innerWidth - 48;
      const width = `${(tableWidth / columns.length / tableWidth) * 100}%`;
      const setWidth = columns.map(c => ({
        ...c,
        width,
      }));
      return setWidth;
    },
    [dataSource, classCount]
  );

  // #endregion

  // #region 事件处理
  const handleTableChange = useCallback((pagination, filters, sorter) => {
    if (sorter && onSortChange && typeof onSortChange === 'function') {
      let sortKey = '';
      let order = '';
      if (Object.keys(sorter).length > 0) {
        sortKey = sorter.columnKey === 'className' ? 'classIndex' : sorter.columnKey;
        order = sorter.order;
      }
      onSortChange(sortKey, order);
    }
    if (pagination && onPageChange && typeof onPageChange === 'function') {
      onSortChange(pagination.current);
    }
  }, []);

  // #endregion

  // table 高度处理，滚动条
  // const otherHeigth = containerWidth < 1200 && classCount > 1 ? 432 : 390;
  // const scroll = containerHeight < 780 ? { y: containerHeight - otherHeigth } : {};

  return (
    // dataSource.length > 0 &&
    <Table
      rowKey="studentId"
      className={styles.transcriptTable}
      // pagination={{ pageSize: 10 }}
      bordered
      loading={loading}
      columns={getColumns}
      dataSource={dataSource}
      onChange={handleTableChange}
      // scroll={scroll}
    />
  );
};

// export default Transcript
export default Dimensions({
  getHeight: () => window.innerHeight,
  getWidth: () => window.innerWidth,
})(TranscriptList);
