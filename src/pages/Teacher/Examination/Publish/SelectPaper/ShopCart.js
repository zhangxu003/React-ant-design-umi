/**
 * 已选试卷
 * @author tina
 */
import React, { PureComponent } from 'react';
import { Icon, List, Divider } from 'antd';
import NoData from '@/components/NoData/index';
import noneicon from '@/assets/none_asset_icon.png';
import { formatMessage, defineMessages } from 'umi/locale';

import { MatchUnitType } from '@/frontlib/utils/utils';
import { countDown } from '@/utils/timeHandle';
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
  selected: { id: 'task.examination.publish.selectedpaper', defaultMessage: '已选试卷' },
  emptypaper: { id: 'task.examination.publish.empty.selectedpaper', defaultMessage: '清空所选' },
  delpaper: { id: 'task.examination.publish.delpaper', defaultMessage: '删除试卷' },
  del: { id: 'task.examination.publish.del', defaultMessage: '删除' },
  cancel: { id: 'task.examination.publish.cancel', defaultMessage: '取消' },
  isdel: { id: 'task.examination.publish.isdelpaper', defaultMessage: '确认要删除该试卷吗？' },
  emptytip: { id: 'task.examination.publish.emptytips', defaultMessage: '您还没有加入试卷' },
});

export default class ShopCart extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { cartList: props.selectedPaperList };
  }

  deleteSelected = () => {
    const { deleteSelectedAll } = this.props;
    deleteSelectedAll();
  };

  hideSelected = () => {
    const { hideSelectedPaper } = this.props;
    hideSelectedPaper();
  };

  deletePaper = (id, e) => {
    const propRemove = this.props;
    const { cartList } = this.state;
    e.stopPropagation();
    // eslint-disable-next-line no-unused-vars
    const paper = cartList.filter(x => x.id !== id);
    propRemove.deletePaperCurrent(id);
  };

  render() {
    const { currentId, selectedPaperList, currentPaperId } = this.props;
    return (
      <div className="paperSelected">
        <div className="navTitle">
          {formatMessage(messages.selected)}{' '}
          <span className="clearAll">
            <span onClick={this.deleteSelected}>{formatMessage(messages.emptypaper)}</span>
            <Icon type="close" theme="outlined" onClick={this.hideSelected} />
          </span>
        </div>
        {selectedPaperList.length > 0 && (
          <List
            className="selectedlist"
            dataSource={selectedPaperList}
            renderItem={item => (
              <List.Item
                className="listItem"
                onClick={() => {
                  currentPaperId(item.id, item.paperType === 'STANDARD_PAPER' ? '1' : '2');
                }}
                style={currentId === item.id ? { background: '#CDF3E1' } : {}}
              >
                <div>
                  <div className="title">{item.name}</div>
                  <div className="tips">
                    <span>{formatMessage(messages.fullmark)}：</span>
                    <span className="black">
                      {item.fullMark} {formatMessage(messages.mark)}
                    </span>
                    &nbsp;&nbsp;
                    <Divider type="vertical" />
                    &nbsp;&nbsp;
                    <span>{formatMessage(messages.time)}：</span>
                    <span className="black">{countDown(item.paperTime)}</span> &nbsp;&nbsp;
                    <Divider type="vertical" className={styles.lineMid} />
                    &nbsp;&nbsp;
                    <span>{formatMessage(messages.grade)}：</span>
                    <span className="black">{MatchUnitType(item)}</span>&nbsp;&nbsp;
                    <Divider type="vertical" />
                    &nbsp;&nbsp;
                    {/* <span>{formatMessage(messages.schoolYear)}：</span><span className="black">{item.annualValue}</span> &nbsp;&nbsp;<Divider type="vertical" />&nbsp;&nbsp; */}
                    <span>{formatMessage(messages.paperTemplate)}：</span>
                    <span className="black">{item.templateName}</span>
                  </div>
                </div>
                <div className="deleteTest" onClick={e => this.deletePaper(item.id, e)}>
                  <Icon type="delete" />
                </div>
              </List.Item>
            )}
          />
        )}
        {selectedPaperList.length === 0 && (
          <NoData noneIcon={noneicon} tip={formatMessage(messages.emptytip)} />
        )}
      </div>
    );
  }
}
