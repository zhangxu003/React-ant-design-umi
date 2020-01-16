import React, { PureComponent } from 'react';
import { Card, Divider, Spin } from 'antd';
import { connect } from 'dva';
import { formatMessage, defineMessages } from 'umi/locale';
import ExampaperPreview from '@/frontlib/components/ExampaperPreview/ExampaperPreview';
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
@connect(({ release, loading }) => ({
  fetchPaperDetailing: loading.effects['release/fetchPaperDetail'],
  currentPaperDetail: release.currentPaperDetail,
  showData: release.showData,
  paperSelected: release.paperSelected,
}))
class ShowPaper extends PureComponent {
  componentDidMount() {
    this.getPaperDetail();
  }

  componentDidUpdate(preProps) {
    const { paperId } = this.props;
    const { paperId: prePaperId } = preProps;
    if (paperId !== prePaperId) {
      this.getPaperDetail();
    }
  }

  /**
   * 根据 参数 paperId 获取 试卷数据
   */
  getPaperDetail() {
    const { dispatch, paperId, paperType } = this.props;
    if (!paperId) return;
    dispatch({
      type: 'release/fetchPaperDetail',
      payload: { paperId, paperType: paperType === 'STANDARD_PAPER' ? '1' : '2' },
    });
  }

  // 关闭弹框
  closeModal = () => {
    const { modal } = this.props;
    modal.destroy();
  };

  render() {
    const { currentPaperDetail, showData, fetchPaperDetailing } = this.props;
    if (!currentPaperDetail || !currentPaperDetail.id)
      return <Spin spinning={fetchPaperDetailing}>{null}</Spin>;

    const { name, fullMark, paperTime, templateName } = currentPaperDetail;

    // 试卷头部信息
    const cardTitle = (
      <div className={styles['card-title']}>
        <div className={styles.name}>{name}</div>
        <div className={styles.tips}>
          <span>{formatMessage(messages.fullmark)}：</span>
          <span className={styles.black}>
            {fullMark} {formatMessage(messages.mark)}
          </span>
          <Divider type="vertical" style={{ margin: '0 20px' }} />
          <span>{formatMessage(messages.time)}：</span>
          <span className={styles.black}>{showTime(paperTime, 's')}</span>
          <Divider type="vertical" style={{ margin: '0 20px' }} />
          <span>{formatMessage(messages.grade)}：</span>
          <span className={styles.black}>{MatchUnitType(currentPaperDetail)}</span>
          <Divider type="vertical" style={{ margin: '0 20px' }} />
          <span>{formatMessage(messages.paperTemplate)}：</span>
          <span className={styles.black}>{templateName}</span>
        </div>
      </div>
    );

    // 右侧按钮
    const extra = <span className="iconfont icon-error" onClick={this.closeModal} />;

    return (
      <Card loading={fetchPaperDetailing} title={cardTitle} extra={extra} className={styles.card}>
        <div className={styles.content}>
          <ExampaperPreview
            showData={showData}
            paperData={currentPaperDetail}
            // eslint-disable-next-line global-require
            apiUrl={require('@/services/apiUrl')}
            displayMode="paper_preview"
          />
        </div>
      </Card>
    );
  }
}

export default ShowPaper;
