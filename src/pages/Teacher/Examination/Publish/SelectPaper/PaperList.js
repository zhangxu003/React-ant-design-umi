/**
 * 试卷列表
 * @author tina
 */
import React, { PureComponent } from 'react';

import { Tabs, List, Checkbox, Tooltip } from 'antd';
import { connect } from 'dva';
import NoData from '@/components/NoData/index';
import PaperFilter from './PaperFilter';
import noneicon from '@/assets/none_asset_icon.png';
import rellicon from '@/assets/examination/rell_icon.png';

import styles from './index.less';

const { TabPane } = Tabs;
@connect(({ release, teacher }) => ({
  paperList: release.paperList,
  myPaperList: release.myPaperList,
  paperSelected: release.paperSelected,
  taskType: release.taskType,
  teacherId: teacher.userInfo.teacherId,
  currentPaperDetail: release.currentPaperDetail,
}))
class PaperList extends PureComponent {
  state = { currentSingle: '' };

  onSwitch = key => {
    const { changePaperType } = this.props;
    changePaperType(key);
    // 当切换到我的组卷时获取 我的组件列表
    const { dispatch, teacherId } = this.props;
    if (key === '2') {
      dispatch({
        type: 'release/fetchMyPaper',
        payload: {
          teacherId,
          keyword: '',
          paperScope: '',
          grade: '',
          pageIndex: '1',
          pageSize: '10',
        },
      });
    }
  };

  checkSingle = e => {
    this.setState({
      currentSingle: e.target.value,
    });
    const { currentPaperId } = this.props;
    currentPaperId(e.target.value);
  };

  render() {
    const { paperList, myPaperList } = this.props;
    const paperLists = paperList && paperList.records;
    const myPaperLists = myPaperList && myPaperList.records;
    const { currentSingle } = this.state;
    const paperlistLength = paperLists ? paperList.total : 0;
    const myListLength = myPaperLists ? myPaperList.total : 0;
    const operations = ''; // '共'+(paperlistLength+myListLength)+'套';
    const mainTitle = '校本资源'; // ('+paperlistLength+')'
    const myTitle = '我的组卷'; // ('+myListLength+')'

    const { paperSelected, taskType, currentPaperDetail, filterPaperLists } = this.props;

    return (
      <div className="paperSource">
        <Tabs
          defaultActiveKey="1"
          onChange={this.onSwitch}
          animated={false}
          tabBarExtraContent={operations}
        >
          <TabPane tab={mainTitle} key="1">
            <PaperFilter
              filterPaper={(paper, years, difficulty, address, examtype) =>
                filterPaperLists(paper, years, difficulty, address, examtype)
              }
            />
            {paperlistLength > 0 && (
              <List
                className="paperlist"
                dataSource={paperLists}
                renderItem={item => {
                  let falg = true;
                  if (taskType !== 'TT_2') {
                    if (paperSelected.length > 0) {
                      if (
                        paperSelected.filter(vo => vo.templateId !== item.paperTemplateId).length >
                        0
                      ) {
                        falg = false;
                      }
                    }
                  }
                  let myCalssName = '';
                  if (falg) {
                    myCalssName =
                      currentSingle === item.paperId && currentPaperDetail.id
                        ? 'paperItem selected'
                        : 'paperItem';
                  } else {
                    myCalssName = 'paperItem noselected';
                  }
                  return (
                    <Tooltip placement="top" title={!falg ? '该试卷结构与已选试卷的结构不同' : ''}>
                      <List.Item className={myCalssName}>
                        <Checkbox
                          value={item.paperId}
                          onChange={e => {
                            this.checkSingle(e, item);
                          }}
                        />

                        <span className="paperNameDetail">{item.paperName}</span>

                        {item.isExamination === 'Y' && (
                          <img src={rellicon} alt="" className={styles.rellicon} />
                        )}
                      </List.Item>
                    </Tooltip>
                  );
                }}
              />
            )}
            {!paperlistLength && <NoData noneIcon={noneicon} tip="暂无试卷" />}
          </TabPane>
          <TabPane tab={myTitle} key="2">
            {myListLength > 0 && (
              <List
                className="paperlist"
                dataSource={myPaperLists}
                renderItem={item => {
                  let falg = true;
                  if (taskType !== 'TT_2') {
                    if (paperSelected.length > 0) {
                      if (
                        paperSelected.filter(vo => vo.templateId !== item.paperTemplateId).length >
                        0
                      ) {
                        falg = false;
                      }
                    }
                  }
                  let myCalssName = '';
                  if (falg) {
                    myCalssName =
                      currentSingle === item.paperId && currentPaperDetail.id
                        ? 'paperItem selected'
                        : 'paperItem';
                  } else {
                    myCalssName = 'paperItem noselected';
                  }
                  return (
                    <Tooltip placement="top" title={!falg ? '该试卷结构与已选试卷的结构不同' : ''}>
                      <List.Item className={myCalssName}>
                        <Checkbox value={item.paperId} onChange={e => this.checkSingle(e, item)} />
                        <span className="paperNameDetail">{item.paperName}</span>
                      </List.Item>
                    </Tooltip>
                  );
                }}
              />
            )}
            {!myListLength && <NoData noneIcon={noneicon} tip="暂无试卷" />}
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default PaperList;
