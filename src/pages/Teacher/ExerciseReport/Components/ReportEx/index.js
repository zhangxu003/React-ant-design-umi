/*
 * @Author    tina.zhang
 * @Date      2019-7-5
 * @copyright 考中互动讲评报告
 */
import React, { Component } from 'react';
import { Card, Anchor } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import cs from "classnames";
import './index.less';
import NoData from '@/components/NoData/index';
import noneicon from '@/frontlib/assets/MissionReport/none_icon_class@2x.png';
import MenuLeft from '@/frontlib/components/MissionReport/Components/PaperReport/MenuLeft';
import ReportRight from '@/frontlib/components/MissionReport/Components/PaperReport/ReportRight';
import { assemblyData, getLinkList, scrollTo } from '@/frontlib/components/MissionReport/Components/utils'
import emitter from '@/utils/ev';
import Dimensions from 'react-dimensions';

@connect(({ exerciseReport }) => ({
  showData: exerciseReport.showData,
  paperData: exerciseReport.paperData,
  teacherPaperInfo: exerciseReport.teacherPaperInfo,
  taskOverview: exerciseReport.taskOverview
}))
class ReportEx extends Component {
  constructor(props) {
    super(props);
    this.state = {
      masterData: {},
      paperList: [],  // 用于显示左侧选择内容
      linkList: [],    // 用于存储试卷的题号link
      paperInfo: [],   // list
      onLoad: true,
      visible: false,
    };
    this.dom = document.getElementById('divReportOverview').parentNode.parentNode.parentNode;
  }

  componentDidMount() {
    const { paperId, snapshotId } = this.props
    // console.log("props",this.props);
    this.loadPaperData(paperId, snapshotId); // 获取paperdata
    this.eventEmitter = emitter.addListener('teacherScroll', (data) => {
      const a = data.split("-")
      this.changeFocusIndex(Number(a[2]), Number(a[0]), Number(a[1]), a[3], false);
    });
  }

  componentWillReceiveProps(nextProps) {
    const { paperId, classId, taskId, snapshotId } = this.props
    if (paperId !== nextProps.paperId) {
      this.loadPaperData(nextProps.paperId, nextProps.snapshotId); // 获取试卷快照
      this.setState({
        onLoad: true
      })
    }
    if (classId !== nextProps.classId) {
      this.loadPaperInfo(taskId, snapshotId, nextProps.classId); // 获取教师报告内容
      this.setState({
        onLoad: true
      })
    }
  }

  // 组卷销毁时清空数据
  componentWillUnmount() {
    window.onscroll = null;
    // dispatch({
    //   type: 'report/clearCache',
    //   payload: {},
    // });
  }


  // 加载试卷快照
  loadPaperData = (paperId, snapshotId) => {
    const { dispatch, taskId, classId, taskOverview } = this.props;
    //! update by leo 2019-10-17 11:58:30
    //! 自由组卷类型，请求不同接口
    const { paperList } = taskOverview;
    const paperInfo = paperList.find(v => v.paperId === paperId);
    let dispatchType = 'exerciseReport/fetchPaperDetail';
    if (paperInfo.paperType === 'CUSTOM_PAPER') {
      dispatchType = 'exerciseReport/fetchCustomPaperDetail'
    }
    dispatch({
      type: dispatchType,
      payload: {
        paperId
      },
    }).then(() => {
      this.loadPaperInfo(taskId, snapshotId, classId);
    });
  };


  // 获取试卷详情
  loadPaperInfo = (taskId, snapshotId, classId) => {
    const { dispatch, paperData, showData } = this.props;
    dispatch({
      type: 'exerciseReport/getAnswerDetail',
      payload: {
        taskId,
        classId,
        snapshotId
      },
    }).then(() => {
      // console.log("teacherPaperInfo",this.props.teacherPaperInfo)
      const paperInfo = this.serch();
      const masterData = assemblyData(paperData, paperInfo, showData)
      const linkList = getLinkList(masterData, this.dom);
      this.setState({
        onLoad: false,
        masterData,
        linkList,
        paperInfo,
      });
    });
  }

  serch = () => {
    const { teacherPaperInfo, snapshotId } = this.props;
    // return "empty";
    if (JSON.stringify(teacherPaperInfo) !== "{}") {
      const data = teacherPaperInfo.answerStatics.find(item => item.snapshotId === snapshotId)
      if (data) {
        return data.answersDetail
      }
      return "empty" // 空试卷
    }
    return "empty" // 空试卷
  }

  onChangeLeft = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
    });
  };


  changeFocusIndex(item, mainIndex, questionIndex, type, linkid) {
    if (linkid) {
      scrollTo(linkid, this.dom);
    }
    const { masterData } = this.state;
    const newData = JSON.parse(JSON.stringify(masterData));
    newData.staticIndex.mainIndex = mainIndex;
    newData.staticIndex.questionIndex = questionIndex;
    if (type === 'TWO_LEVEL') {
      newData.staticIndex.subIndex = item;
    } else {
      delete newData.staticIndex.subIndex;
    }
    this.setState({ masterData: newData });
  }


  renderLeft() {
    const { taskInfo, paperData, role } = this.props;
    const { masterData, visible, paperList } = this.state;
    if (visible) {
      return (
        <div className="selectpaperDrawer">
          <Anchor offsetTop={100} getContainer={() => this.dom}>
            <MenuLeft
              paperData={paperData}
              masterData={masterData}
              taskInfo={taskInfo}
              self={this}
              role={role}
              paperList={paperList}
              callback={(id) => this.loadPaperData(id)}
            />
            <div className="tag" onClick={this.onChangeLeft}>
              <div>
                <div>
                  <i className={cs('iconfont', 'icon-link-arrow-left')} />
                </div>
                <div className="text">
                  {formatMessage({ id: "task.button.exercisereport.reportPanel.unExtendedText", defaultMessage: "收起" })}
                </div>
              </div>
            </div>
          </Anchor>
        </div>
      )
    }

    return (
      <div className="selectpaperDraweropen">
        <Anchor className="anchor" offsetTop={100} getContainer={() => this.dom}>
          <div className="tag" onClick={this.onChangeLeft}>
            <div>
              <div>
                <i className={cs('iconfont', 'icon-link-arrow')} />
              </div>
              <div className="text">
                {formatMessage({ id: "task.button.exercisereport.reportPanel.extendedText", defaultMessage: "展开" })}
              </div>
            </div>
          </div>
        </Anchor>
      </div>
    )
  }


  render() {
    const { taskInfo, paperData, showData, role, containerWidth, classId, taskId, paperId, classCount } = this.props;
    const { masterData, onLoad, paperInfo, paperList } = this.state;

    console.log("containerWidth", containerWidth);
    return (
      <div className="ReportEx">
        {onLoad ?
          <NoData noneIcon={noneicon} tip={formatMessage({ id: "task.message.loading.report", defaultMessage: "任务报告加载中，请稍等..." })} onLoad={onLoad} />
          :
          <Card bordered={false}>
            <div className="report">
              <div className="paperreport">
                {
                  Object.keys(masterData).length > 0 &&
                  <div>
                    {
                      containerWidth <= 1366 ? this.renderLeft() :
                        <div className="flexLeft">
                          <Anchor offsetTop={100} getContainer={() => this.dom}>
                            <MenuLeft
                              paperData={paperData}
                              masterData={masterData}
                              taskInfo={taskInfo}
                              self={this}
                              role={role}
                              paperList={paperList}
                              callback={(id) => this.loadPaperData(id)}
                            />
                          </Anchor>
                        </div>
                    }
                  </div>
                }
                {Object.keys(showData).length > 0 && (
                  <ReportRight
                    key={classId}
                    showData={showData}
                    taskId={taskId}
                    paperId={paperId}
                    classNum={classCount}
                    paperData={paperData}
                    classId={classId}
                    teacherPaperInfo={paperInfo}
                    exercise // 练习模式
                    role={role}
                  />
                )}
              </div>
            </div>
          </Card>}
      </div>
    );
  }
}

export default Dimensions({
  getHeight: () => window.innerHeight,
  getWidth: () => window.innerWidth,
})(ReportEx)
