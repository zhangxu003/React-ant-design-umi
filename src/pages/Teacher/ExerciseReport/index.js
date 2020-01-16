import React, { PureComponent } from 'react';
import { Drawer, message, BackTop } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import NoData from '@/components/NoData/index';
import noneicon from '@/frontlib/assets/MissionReport/none_icon_class@2x.png';
import TaskInfo from './Components/TaskInfo';
import ReportTab from './Components/ReportTab';
import ReportFilter from './Components/ReportFilter';
import Transcript from './Components/Transcript';
import ReportEx from './Components/ReportEx';
import constant from '@/frontlib/components/MissionReport/constant';
import styles from './index.less';

// const keys
const { FULL_PAPER_ID, FULL_CLALSS_ID, REPORT_TAB_KEY } = constant;

/**
 * 练习实时报告入口
 * @author tina.zhang
 * @date   2019-07-03
 * @param {string} taskId 任务ID
 * @param {function} onClose 关闭回调
 */
@connect(({ exerciseReport, permission }) => ({
  taskOverview: exerciseReport.taskOverview,
  permission,
  classId: FULL_CLALSS_ID,
}))
class TeacherReport extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      drawerVisible: true,
      pageLoading: true,
      paperId: FULL_PAPER_ID,
      classId: FULL_CLALSS_ID,
      classIdList: [],
      activeTabKey: REPORT_TAB_KEY.transcript,
      hoverBacktop: false, // 返回顶部 hover 状态
      backTopRightStyle: null, // 返回顶部按钮style
    };
    this.intervalIndex = null;
  }

  componentDidMount() {
    this.loadTaskOverview();
    // 轮询 练习报告生成时间戳
    this.intervalIndex = setInterval(() => {
      this.getExerciseTimeStamp();
    }, 20000);
    // 监听 resize
    setTimeout(() => {
      window.addEventListener('resize', this.getBacktopRight);
      const [uexamPopWindow] = document
        .getElementsByClassName('divReportOverview_Drawer')[0]
        .getElementsByClassName('ant-drawer-content');
      uexamPopWindow.addEventListener('scroll', this.getBacktopRight);
      window.addEventListener('scroll', this.getBacktopRight);
    }, 500);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({ type: 'exerciseReport/clearCache' });
    if (this.intervalIndex) {
      window.clearInterval(this.intervalIndex);
    }
    window.removeEventListener('resize', this.getBacktopRight);
    const [uexamPopWindow] = document
      .getElementsByClassName('divReportOverview_Drawer')[0]
      .getElementsByClassName('ant-drawer-content');
    uexamPopWindow.removeEventListener('scroll', this.getBacktopRight);
    window.removeEventListener('scroll', this.getBacktopRight);
  }

  // 加载任务信息
  loadTaskOverview = () => {
    const { dispatch, taskId } = this.props;
    dispatch({
      type: 'exerciseReport/getExerciseTaskOverview',
      payload: {
        taskId,
      },
    }).then(res => {
      let tempPaperId = FULL_PAPER_ID;
      if (res.data && res.data.paperList) {
        const { paperList } = res.data;
        tempPaperId = paperList[0].paperId;
      } else {
        message.info(
          formatMessage({
            id: 'task.text.exercisereport.noreport',
            defaultMessage: '暂无报告数据...',
          })
        );
      }
      this.setState({
        paperId: tempPaperId,
        pageLoading: false,
      });
    });
  };

  // 获取练习报告生成结果
  getExerciseTimeStamp = () => {
    const { dispatch, taskId } = this.props;
    dispatch({
      type: 'exerciseReport/getExerciseTimeStamp',
      payload: {
        taskId,
      },
    }).then(res => {
      if (res.responseCode !== '200') {
        message.error(res.data);
        return;
      }
      const { taskOverview } = this.props;
      const { timeStamp } = res.data;
      if (!taskOverview) {
        return;
      }
      const { timeStamp: curTimeStamp } = taskOverview;
      if (Number(timeStamp) > Number(curTimeStamp)) {
        message.info(
          formatMessage({
            id: 'task.message.exercisereport.newReportTip',
            defaultMessage: '新的练习结果已统计完成，请刷新',
          })
        );
      }
    });
  };

  // 切换选项卡
  handleTabChange = key => {
    // 此刻判断是否有权限
    const { taskOverview, permission, dispatch } = this.props;
    if (permission && !permission.V_ANSWER_DETAIL && key === 'paperreport') {
      dispatch({
        type: 'permission/open',
        payload: 'V_ANSWER_DETAIL',
      });
      return;
    }
    const { paperId } = this.state;
    if (key === REPORT_TAB_KEY.paperreport && paperId === FULL_PAPER_ID) {
      const paperInfo = taskOverview.paperList[0];
      this.setState({
        activeTabKey: key,
        paperId: paperInfo.paperId,
      });
    } else {
      this.setState({
        activeTabKey: key,
      });
    }
  };

  // 试卷选择
  handlePaperChanged = value => {
    this.setState({
      paperId: value,
    });
  };

  // 班级选择(多班&单班)
  handleClassChanged = value => {
    const { activeTabKey } = this.state;
    if (activeTabKey === REPORT_TAB_KEY.paperreport) {
      this.setState({
        classId: value,
        classIdList: [],
      });
    } else {
      const val = value && value.length > 0 ? value : [];
      this.setState({
        classId: FULL_CLALSS_ID,
        classIdList: val,
      });
    }
  };

  // 刷新报告
  handleRefreshReport = () => {
    this.setState(
      {
        pageLoading: true,
        classId: FULL_CLALSS_ID,
        classIdList: [],
      },
      () => {
        // 加载任务信息
        this.loadTaskOverview();
      }
    );
  };

  // 关闭报告
  handleDrawerClose = () => {
    this.setState({
      drawerVisible: false,
    });
    const { onClose } = this.props;
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  // backtop hover 事件
  handleMouseHover = hover => {
    this.setState({
      hoverBacktop: hover,
    });
  };

  getBacktopTarget = () => {
    const backTopTarget = document.getElementById('divReportOverview').parentNode.parentNode
      .parentNode;
    return backTopTarget;
  };

  getBacktopRight = () => {
    setTimeout(() => {
      const { activeTabKey } = this.state;
      const windowWith = window.innerWidth;
      if (activeTabKey === REPORT_TAB_KEY.paperreport && windowWith > 1366) {
        const rightFlexLeft = document.getElementsByClassName('flexLeft').length > 0 ? 205 : 0;
        const rightCardWidth = 846;
        const reportLeft = document.getElementById('divReportOverview').offsetLeft - 20;
        const rightContainerWidth =
          document.getElementsByClassName('reportRight')[0].clientWidth + 44;
        const left =
          reportLeft +
          rightFlexLeft +
          rightContainerWidth -
          (rightContainerWidth - rightCardWidth) / 2 +
          40 +
          20;
        this.setState({
          backTopRightStyle: {
            right: windowWith - left - 40,
          },
        });
        return;
      }
      this.setState({
        backTopRightStyle: null,
      });
    }, 50);
  };

  // 加载试卷快照
  loadPaperData = (paperId, snapshotId) => {
    const { dispatch, taskId, classId, taskOverview } = this.props;
    //! update by leo 2019-10-17 11:58:30
    //! 自由组卷类型，请求不同接口
    const { paperList } = taskOverview;
    const paperInfo = paperList.find(v => v.paperId === paperId);
    let dispatchType = 'exerciseReport/fetchPaperDetail';
    if (paperInfo.paperType === 'CUSTOM_PAPER') {
      dispatchType = 'exerciseReport/fetchCustomPaperDetail';
    }
    dispatch({
      type: dispatchType,
      payload: {
        paperId,
      },
    }).then(() => {
      this.loadPaperInfo(taskId, snapshotId, classId);
    });
  };

  // 获取试卷详情
  loadPaperInfo = (taskId, snapshotId, classId) => {
    const { dispatch, onOpen } = this.props;
    dispatch({
      type: 'paperEvaluation/getAnswerDetail',
      payload: {
        taskId,
        studentId: this.studentId,
        classId,
        snapshotId,

        // taskId:"452010511646630871041",
        // snapshotId:'452000869175542153217',
        // classId,
        // studentId:'46542942457827557'
      },
    }).then(() => {
      onOpen(this.studentId);
    });
  };

  render() {
    const { taskOverview, taskId, permission } = this.props;
    const {
      drawerVisible,
      pageLoading,
      activeTabKey,
      paperId,
      classIdList,
      classId,
      backTopRightStyle,
      hoverBacktop,
    } = this.state;
    // 答题详情页试卷必选（默认为选中列表中第一项）、班级选择框不允许多选
    const isPaperReport = activeTabKey === REPORT_TAB_KEY.paperreport;

    let snapshotId = null;
    const classNames = [];
    if (!pageLoading && taskOverview && taskOverview.paperList) {
      const { paperList } = taskOverview;
      const paperInfo = paperList.find(v => v.paperId === paperId);
      snapshotId = paperInfo ? paperInfo.snapshotId : null;
      if (classIdList && classIdList.length > 0) {
        taskOverview.classList.forEach(c => {
          if (classIdList.indexOf(c.classId) >= 0) {
            classNames.push(c.className);
          }
        });
      }
    }

    return (
      <Drawer
        placement="bottom"
        closable
        onClose={this.handleDrawerClose}
        destroyOnClose
        wrapClassName="divReportOverview_Drawer"
        maskClosable={false}
        visible={drawerVisible}
        className={styles.exerciseDrawer}
        height="calc( 100% - 55px )"
      >
        <div id="divReportOverview" className={styles.exerciseReport}>
          {pageLoading && (
            <NoData
              noneIcon={noneicon}
              tip={formatMessage({
                id: 'task.text.exercisereport.reportLoading',
                defaultMessage: '实时报告加载中，请稍等...',
              })}
              onLoad={pageLoading}
            />
          )}
          {!pageLoading && taskOverview && (
            <div className={styles.reportContent}>
              <TaskInfo
                taskOverview={taskOverview}
                refreshReport={this.handleRefreshReport}
                permission={permission}
                onOpen={() => {
                  const { dispatch } = this.props;
                  if (permission && !permission.V_CLASSROOM_REVIEW) {
                    dispatch({
                      type: 'permission/open',
                      payload: 'V_CLASSROOM_REVIEW',
                    });
                    return;
                  }
                  this.loadPaperData(paperId, snapshotId);
                }}
              />
              <ReportTab
                defaultActiveTabKey={activeTabKey}
                onChange={key => this.handleTabChange(key)}
                permission={permission}
              />
              {taskOverview.paperList && taskOverview.classList && (
                <ReportFilter
                  showFullPaperOption={false}
                  defaultPaperId={paperId}
                  paperList={taskOverview.paperList}
                  classList={taskOverview.classList}
                  multiple={!isPaperReport}
                  onPaperChanged={this.handlePaperChanged}
                  onClassChanged={this.handleClassChanged}
                />
              )}
              {activeTabKey === REPORT_TAB_KEY.transcript && (
                <Transcript
                  taskId={taskId}
                  snapshotId={snapshotId}
                  classCount={taskOverview.classList.length}
                  classNames={classNames}
                  onOpen={id => {
                    this.studentId = id;
                    this.loadPaperData(paperId, snapshotId);
                  }}
                />
              )}
              {activeTabKey === REPORT_TAB_KEY.paperreport && (
                <ReportEx
                  classId={classId}
                  paperId={paperId}
                  snapshotId={snapshotId}
                  taskId={taskId}
                  // eslint-disable-next-line jsx-a11y/aria-role
                  role
                />
              )}
            </div>
          )}
          <BackTop
            style={backTopRightStyle}
            visibilityHeight={50}
            target={() => this.getBacktopTarget()}
          >
            <div
              className={styles.backtop}
              onMouseEnter={() => this.handleMouseHover(true)}
              onMouseLeave={() => this.handleMouseHover(false)}
            >
              {!hoverBacktop && <i className="iconfont icon-top" />}
              {hoverBacktop && (
                <span className={styles.text}>
                  {formatMessage({ id: 'app.text.report.backtop', defaultMessage: '顶部' })}
                </span>
              )}
            </div>
          </BackTop>
        </div>
      </Drawer>
    );
  }
}

export default TeacherReport;
