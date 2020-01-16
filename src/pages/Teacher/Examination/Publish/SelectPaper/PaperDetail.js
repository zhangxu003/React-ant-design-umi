/**
 * 试卷详情
 * @author tina
 */
import React, { PureComponent } from 'react';
import { Divider, Tooltip, message } from 'antd';

import IconButton from '@/frontlib/components/IconButton';
import { connect } from 'dva';
import { formatMessage, defineMessages } from 'umi/locale';
import ExampaperPreview from '@/frontlib/components/ExampaperPreview/ExampaperPreview';
import noneicon from '@/assets/none_choose_icon.png';
import NoData from '@/components/NoData/index';
import { MatchUnitType } from '@/frontlib/utils/utils';
import { showTime } from '@/utils/timeHandle';
import styles from './index.less';

const messages = defineMessages({
  schoolYear: { id: 'task.school.year', defaultMessage: '学年' },
  grade: { id: 'task.grade', defaultMessage: '适用范围' },
  time: { id: 'task.examination.inspect.task.detail.time', defaultMessage: '时长' },
  fullmark: { id: 'task.examination.inspect.task.detail.full.mark', defaultMessage: '总分' },
  paperTemplate: {
    id: 'task.examination.inspect.task.detail.paper.template',
    defaultMessage: '试卷结构',
  },
  mark: { id: 'task.examination.inspect.paper.mark', defaultMessage: '分' },
  choosed: { id: 'task.examination.publish.paper.selected', defaultMessage: '已选' },
  addtask: { id: 'task.examination.publish.paper.addtask', defaultMessage: '加入任务' },
});
@connect(({ release }) => ({
  currentPaperDetail: release.currentPaperDetail,
  showData: release.showData,
  paperSelected: release.paperSelected,
}))
class PaperDetail extends PureComponent {
  state = { addCart: true };

  addPaper = item => {
    const { paperSelected, addPaperCart } = this.props;
    const { addCart } = this.state;
    if (paperSelected.length === 10) {
      message.warning(
        formatMessage({
          id: 'task.message.youCanAddUpTo10SheetsOfPaper',
          defaultMessage: '您最多可以添加 10 张试卷',
        })
      );
    } else {
      addPaperCart(item);
      this.setState({
        addCart: !addCart,
      });
    }
  };

  render() {
    const { currentPaperDetail, showData, addCartStatus } = this.props;
    if (currentPaperDetail) {
      return (
        <div className="testDetail" style={{ display: 'block' }}>
          <div className="paperTitle">
            <div>
              <div className="title">{currentPaperDetail.name}</div>
              <div className="tips">
                <span>{formatMessage(messages.fullmark)}：</span>
                <span className="black">
                  {currentPaperDetail.fullMark} {formatMessage(messages.mark)}
                </span>
                &nbsp;&nbsp;
                <Divider type="vertical" />
                &nbsp;&nbsp;
                <span>{formatMessage(messages.time)}：</span>
                <span className="black">{showTime(currentPaperDetail.paperTime, 's')}</span>{' '}
                &nbsp;&nbsp;
                <Divider type="vertical" />
                &nbsp;&nbsp;
                <span>{formatMessage(messages.grade)}：</span>
                <span className="black">{MatchUnitType(currentPaperDetail)}</span>&nbsp;&nbsp;
                <Divider type="vertical" />
                &nbsp;&nbsp;
                <span>{formatMessage(messages.paperTemplate)}：</span>
                <span className="black">{currentPaperDetail.templateName}</span>
              </div>
            </div>

            {addCartStatus ? (
              <div className="selectedTest">
                <IconButton
                  text={formatMessage(messages.choosed)}
                  type="button"
                  iconName="iconfont icon-right"
                  textColor="textColor"
                  // onClick={(item)=>this.addPaper(this.props.currentPaperDetail)}
                />{' '}
              </div>
            ) : (
              <Tooltip placement="top" title={formatMessage(messages.addtask)}>
                <div className="addCart">
                  <IconButton
                    text=""
                    type="button"
                    iconName="iconfont icon-add"
                    onClick={() => this.addPaper(currentPaperDetail)}
                  />
                </div>
              </Tooltip>
            )}
          </div>
          <div className="paperContent">
            <div
              style={{
                backgroundColor: '#f5f5f5',
                justifyContent: 'center',
                display: 'flex',
                minHeight: '71vh',
              }}
            >
              <div style={{ position: 'absolute' }}>
                <div id="recorder_swf" />
              </div>
              <div>
                {currentPaperDetail.id && (
                  <ExampaperPreview
                    key={currentPaperDetail.id}
                    showData={showData}
                    className={styles.exampaperPre}
                    paperData={currentPaperDetail}
                    // eslint-disable-next-line global-require
                    apiUrl={require('@/services/apiUrl')}
                    displayMode="paper_preview"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="testDetail_none">
        <NoData noneIcon={noneicon} tip="点击左侧试卷名称预览试卷" />
      </div>
    );
  }
}

export default PaperDetail;
