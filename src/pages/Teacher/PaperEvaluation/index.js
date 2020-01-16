import React, { PureComponent } from 'react';
import { Drawer, Tabs, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import Dimensions from 'react-dimensions';
import cs from 'classnames';
import styles from './index.less';
import ExampaperProduct from './ExampaperProduct';
import LeftMenuExam from './ExampaperProduct/LeftMenuExam';
import Draw from './draw';
import IconButton from '@/frontlib/components/IconButton';
import AnswerResult from './Components/AnswerResult';
import StudentAnswer from './Components/StudentAnswer';
import { startCast, stopCast } from '@/utils/instructions';

const instructions = require('@/utils/instructions');

const { TabPane } = Tabs;

@Dimensions({
  getHeight: () => window.innerHeight,
  getWidth: () => window.innerWidth,
})
/**
 * 练习实时报告入口
 * @author tina.zhang
 * @date   2019-07-03
 * @param {string} taskId 任务ID
 * @param {function} onClose 关闭回调
 */
@connect(({ exerciseReport, paperEvaluation }) => ({
  showData: exerciseReport.showData,
  paperData: exerciseReport.paperData,
  teacherPaperInfo: exerciseReport.teacherPaperInfo,
  taskOverview: exerciseReport.taskOverview,
  masterData: paperEvaluation.masterData,
  isCanSee: paperEvaluation.isCanSee,
  studentId: paperEvaluation.studentId,
}))
class PaperEvaluation extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      drawerVisible: true,
    };
    this.intervalIndex = null;
    this.drawRef = React.createRef();
  }

  componentDidMount() {
    /**
     * @Author   tina.zhang
     * @DateTime  2018-10-17
     * @copyright 生成主控数据
     * @param     {[type]}    data 试卷详情
     * @return    {[type]}         [description]
     */

    const { dispatch, paperData, showData } = this.props;
    const invalidate = [];
    dispatch({
      type: 'paperEvaluation/assemblyData',
      payload: {
        data: paperData,
        invalidate,
        showData,
      },
    });

    dispatch({
      type: 'paperEvaluation/fetchAnswerData',
    });
    setTimeout(() => {
      this.canCast();
    }, 1000);
  }

  componentWillUnmount() {}

  canCast = () => {
    const { vb } = window;
    console.log('====投屏=====', vb.canCast);
    if (!vb.canCast) {
      message.warn(
        formatMessage({ id: 'task.text.canCast', defaultMessage: '无扩展副屏，投屏无效' })
      );
    } else {
      startCast('divDisplay'); // 开始投屏
    }
  };

  // 关闭报告
  handleDrawerClose = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'paperEvaluation/saveisCanSee',
      payload: false,
    });
    this.setState({
      drawerVisible: false,
    });
    const { onClose } = this.props;
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
    stopCast();
  };

  // 隐藏答案
  handleanswer = () => {
    const { isCanSee, dispatch } = this.props;
    dispatch({
      type: 'paperEvaluation/saveisCanSee',
      payload: !isCanSee,
    });
  };

  render() {
    const { drawerVisible } = this.state;
    const { paperData, showData, masterData, isCanSee, studentId } = this.props;

    return (
      <Drawer
        placement="bottom"
        closable={false}
        onClose={this.handleDrawerClose}
        destroyOnClose
        wrapClassName="divReportOverview_Drawer"
        maskClosable={false}
        visible={drawerVisible}
        className={styles.PaperEvaluation}
        height="100%"
      >
        <div className={styles.divReportOverviewContent}>
          <div className={styles.PaperEvaluation_Top}>
            <div className={styles.paperName}>{paperData.name}</div>
            <div className={styles.closeBtn} onClick={this.handleDrawerClose}>
              <i className="iconfont icon-close" />
              {formatMessage({ id: 'task.text.endcommenting', defaultMessage: '结束讲评' })}
            </div>
          </div>
          <div className={styles.PaperEvaluation_content}>
            <div className={styles.ExampaperProduct}>
              <div id="divDisplay" className={cs(styles.paperLeft, 'divDisplay')}>
                <div ref={this.drawRef} className={styles.drawRef}>
                  {masterData && (
                    <ExampaperProduct
                      paperData={paperData}
                      showData={showData}
                      instructions={instructions}
                      index={this}
                      callback={() => {}}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className={styles.paperRight}>
              <div className={styles.paperIconContent}>
                <div className={styles.paperIcon}>
                  {masterData && masterData.mains && (
                    <LeftMenuExam
                      ExampaperStatus="EXAM"
                      index={this}
                      paperData={paperData}
                      instructions={instructions}
                    />
                  )}
                </div>
              </div>
              <div className={styles.paperInfo}>
                <Tabs type="card" animated={false} tabBarGutter={0}>
                  <TabPane tab="答题情况" key="1">
                    <AnswerResult />
                  </TabPane>
                  <TabPane tab="学生答案" key="2">
                    <StudentAnswer />
                  </TabPane>
                </Tabs>
              </div>
            </div>
          </div>
          <div className={styles.PaperEvaluation_bottom}>
            <div
              className={styles.closeBtn}
              onClick={this.handleanswer}
              style={{ marginRight: 8, height: 36 }}
            >
              {isCanSee ? (
                <>
                  <IconButton
                    iconName="icon-hide"
                    textColor="greycolor"
                    text={
                      studentId
                        ? formatMessage({ id: 'task.text.hidescore', defaultMessage: '隐藏得分' })
                        : formatMessage({ id: 'task.text.hideanswer', defaultMessage: '隐藏答案' })
                    }
                  />
                </>
              ) : (
                <>
                  <IconButton
                    iconName="icon-eye"
                    textColor="greycolor"
                    text={
                      studentId
                        ? formatMessage({ id: 'task.text.showscore', defaultMessage: '显示得分' })
                        : formatMessage({
                            id: 'task.text.nohideanswer',
                            defaultMessage: '显示答案',
                          })
                    }
                  />
                </>
              )}
            </div>
            {masterData && (
              <Draw
                uuiq={`${masterData.staticIndex.mainIndex}${masterData.staticIndex.questionIndex}`}
                relation={this.drawRef}
              />
            )}
          </div>
        </div>
      </Drawer>
    );
  }
}

export default PaperEvaluation;
