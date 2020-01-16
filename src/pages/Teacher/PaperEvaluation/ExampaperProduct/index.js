/* eslint-disable camelcase */
/* eslint-disable eqeqeq */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react/no-unused-state */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Layout } from 'antd';
import RightContent from './RightContent';

@connect(({ paperEvaluation }) => ({
  masterData: paperEvaluation.masterData,
}))
/**
 * 制卷组件
 * paperData 试卷详情
 * ExampaperStatus 当前状态
 *
 *  *  @Author: tina.zhang
 */
class ExampaperProduct extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      masterData: {},
      mainType: false,
      guideIndex: '',
      paperList: [], // 练习结果页面数据
      isConnect: true, // 是否连接学生机
      startExamTime: '',
    };
    this.drawRef = React.createRef();
  }

  componentDidMount() {
    const { ExampaperStatus } = this.props;
    const now = new Date().getTime();
    this.state.startExamTime = now;
    window.ExampaperStatus = ExampaperStatus;
    localStorage.setItem('ExampaperStatus', ExampaperStatus);
  }

  /**
   * 监听教师端指令
   * @Author   tina.zhang
   * @DateTime 2018-12-18T10:23:57+0800
   * @return   {[type]}                 [description]
   */
  receiveInfo = () => {
    const { instructions } = this.props;
    const { onReceive } = instructions;

    onReceive(e => {
      if (e) {
        // const receiveData = e.data;
        switch (e.command) {
          /** 考试中，重写连接 */
          case 'connect':
            console.log('=================connect==================');

            break;
          default:
            break;
        }
      }
    });
  };

  render() {
    const { mainType, guideIndex } = this.state;
    const {
      paperData,
      showData,
      editData,
      invalidate,
      ExampaperStatus,
      isExamine,
      masterData,
    } = this.props;
    if (masterData.controlStatus == undefined) {
      return null;
    }

    return (
      <div className="ExampaperProducts" id="examRoot" ref={this.drawRef}>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <Layout className="leftMenus">
            <RightContent
              masterData={masterData}
              index={this}
              isExamine={isExamine}
              paperData={paperData}
              invalidate={invalidate}
              showData={showData}
              editData={editData}
              mainType={mainType}
              guideIndex={guideIndex}
              ExampaperStatus={ExampaperStatus}
            />
          </Layout>
        </div>
      </div>
    );
  }
}

export default ExampaperProduct;
