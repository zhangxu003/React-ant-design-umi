import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { formatMessage } from 'umi/locale';
import ReportPanel from '@/frontlib/components/MissionReport/Components/ReportPanel';
import compare from '@/frontlib/utils/compare';
import NoData from '@/components/NoData/index';
import noneicon from '@/frontlib/assets/MissionReport/none_icon_class@2x.png';
import TranscriptList from './TranscriptList';
import styles from './index.less';

/**
 * 教师报告-成绩单
 * @author tina.zhang
 * @date   2019-07-03
 * @param {object} taskId - 任务ID
 * @param {object} snapshotId - 试卷快照ID
 * @param {object} classNames - 班级名称列表
 */
function Transcript(props) {
  const {
    dispatch,
    taskId,
    transcript,
    snapshotId,
    classCount,
    classNames,
    pageLoading,
    onOpen,
  } = props;

  const [state, setState] = useState({
    tableDataSource: [],
    sorter: null, // { sortKey, order }
  });

  // // 排序
  // const compare = useCallback((propName, sorttype = 'ascend') => {
  //   const theProps = ['responseQuestionScore', 'subjectScore', 'objectScore', 'elapsedTime'];
  //   // descend
  //   if (sorttype === 'descend') {
  //     return (obj1, obj2) => {
  //       let o1 = obj1[propName];
  //       let o2 = obj2[propName];
  //       if (theProps.indexOf(propName) !== -1) {
  //         if (obj1.responseQuestionScore === null) {
  //           o1 = -1;
  //         }
  //         if (obj2.responseQuestionScore === null) {
  //           o2 = -1;
  //         }
  //       }

  //       if (o1 > o2) {
  //         return -1;
  //       }
  //       if (o1 === o2) {
  //         return 0;
  //       }
  //       return 1;
  //     };
  //   }
  //   // ascend
  //   return (obj1, obj2) => {
  //     let o1 = obj1[propName];
  //     let o2 = obj2[propName];
  //     if (theProps.indexOf(propName) !== -1) {
  //       if (obj1.responseQuestionScore === null) {
  //         o1 = Number.MAX_SAFE_INTEGER;
  //       }
  //       if (obj2.responseQuestionScore === null) {
  //         o2 = Number.MAX_SAFE_INTEGER;
  //       }
  //     }

  //     if (o1 < o2) {
  //       return -1;
  //     }
  //     if (o1 === o2) {
  //       return 0;
  //     }
  //     return 1;
  //   };
  // }, []);

  // 加载成绩单列表
  useEffect(() => {
    dispatch({
      type: 'exerciseReport/getExerciseTranscript',
      payload: { taskId },
    });
  }, []);

  // 处理 table 数据源
  const tableDataSource = useMemo(
    () => {
      if (!transcript || !transcript.transcriptStatics) {
        return null;
      }
      const { transcriptStatics } = transcript;
      const filterBySnapshotId = transcriptStatics.find(v => v.snapshotId === snapshotId)
        .reportTranscript;
      let filterByClassName = filterBySnapshotId;
      if (classNames && classNames.length > 0) {
        filterByClassName = filterBySnapshotId.filter(v => classNames.indexOf(v.className) >= 0);
      }
      const notNullScore = filterByClassName.filter(v => v.responseQuestionScore !== null);
      const nullScore = filterByClassName.filter(v => v.responseQuestionScore === null);

      if (state.sorter) {
        const { sortKey, order } = state.sorter;
        if (
          ['responseQuestionScore', 'subjectScore', 'objectScore', 'elapsedTime'].indexOf(sortKey) >
          -1
        ) {
          return [...notNullScore].sort(compare(sortKey, order)).concat(nullScore);
        }
        return [...notNullScore, ...nullScore].sort(compare(sortKey, order));
      }
      return notNullScore.concat(nullScore);
    },
    [transcript, snapshotId, classNames, state.sorter]
  );

  const stateRef = useRef();
  stateRef.current = state;
  // // 分页事件
  // const handleTablePageChange = useCallback((pageIndex) => {
  // })
  // 排序事件
  const handleTableSortChange = useCallback((sortKey, order) => {
    setState({
      ...stateRef.current,
      sorter: sortKey && order ? { sortKey, order } : null,
    });
  });

  return (
    <div className={styles.reportTranscript}>
      {pageLoading && (
        <NoData
          noneIcon={noneicon}
          tip={formatMessage({
            id: 'task.text.exercisereport.transcript.loadingTip',
            defaultMessage: '成绩单加载中，请稍等...',
          })}
          onLoad={pageLoading}
        />
      )}
      {!pageLoading && transcript && (
        <ReportPanel padding="0" bgColor="#fff" style={{ borderRadius: '0px' }}>
          {/* {tableDataSource && tableDataSource.length > 0 && */}
          <TranscriptList
            dataSource={tableDataSource}
            classCount={classCount}
            onOpen={id => {
              onOpen(id);
            }}
            // loading={state.tableLoading}
            // onPageChange={handleTablePageChange}
            onSortChange={handleTableSortChange}
          />
          {/* } */}
        </ReportPanel>
      )}
    </div>
  );
}

// export default Transcript;
export default connect(({ exerciseReport, loading }) => ({
  // 成绩单数据
  transcript: exerciseReport.transcript,
  // 页面加载状态
  pageLoading: loading.effects['exerciseReport/getTranscript'],
}))(withRouter(Transcript));
