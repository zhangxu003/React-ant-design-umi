import React, { Component } from 'react';
import { connect } from 'dva';
import { UserPageComponent as ExampaperProduct } from '@/frontlib';

const instructions = require('@/utils/instructions');

@connect(({ student }) => ({
  paperDeatilData: student.paperData,
  papershowData: student.showData,
  paperList: student.paperList,
}))
class ExamPaper extends Component {
  state = {
    isLoad: true,
  };

  render() {
    const { isLoad } = this.state;
    const { paperDeatilData, papershowData, paperList, dispatch } = this.props;
    return (
      <div style={{ backgroundColor: 'rgb(70, 71, 73)' }}>
        <div style={{ position: 'absolute' }}>
          <div id="recorder_swf" />
        </div>
        <ExampaperProduct
          paperData={paperDeatilData}
          showData={papershowData}
          isLoad={isLoad}
          ExampaperStatus="EXAM"
          instructions={instructions}
          paperList={paperList}
          index={this}
          callback={e => {
            dispatch({
              type: 'student/setPaperList',
              payload: e,
            });
          }}
        />
      </div>
    );
  }
}
export default ExamPaper;
