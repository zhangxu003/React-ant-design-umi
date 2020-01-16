/* eslint-disable camelcase */
/* eslint-disable no-lonely-if */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable eqeqeq */
/* eslint-disable consistent-return */
/* eslint-disable react/no-array-index-key */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import DotTag from '../Components/DotTag';
import { toChinesNum } from '@/frontlib/utils/utils';
import styles from './index.less';

@connect(({ paperEvaluation }) => ({
  masterData: paperEvaluation.masterData,
}))
class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.index = 0;
  }

  componentDidMount() {}

  onClick(item, mainIndex, questionIndex, type, questionId) {
    const { dispatch } = this.props;

    dispatch({
      type: 'paperEvaluation/changeFocusIndex',
      payload: {
        item,
        mainIndex,
        questionIndex,
        type,
        questionId,
      },
    }).then(() => {
      this.scrollTop();
    });
  }

  /**
   * @Author   tina.zhang
   * @DateTime  2018-11-23
   * @copyright 滚动到指定位置
   * @return    {[type]}    [description]
   */
  scrollTop = () => {
    setTimeout(() => {
      if (document.querySelectorAll("div[class='addquestion_Item']")[0]) {
        const addquestion_Item = document.querySelectorAll("div[class='addquestion_Item']")[0]
          .childNodes;
        let height = 0;
        for (const n in addquestion_Item) {
          if (addquestion_Item[n].className) {
            if (n != 0) {
              height += Number(addquestion_Item[n - 1].offsetHeight);
            }
            if (addquestion_Item[n].className.indexOf('addquestion-focus') > -1) {
              if (n == 0) {
                height = 0;
              }
              break;
            }
          }
        }
        document.getElementById('divDisplay').scrollTop = height;
      }
    }, 100);
  };

  /**
   * 渲染题序
   * @Author   tina.zhang
   * @DateTime 2018-12-27T17:33:26+0800
   * @param    {[type]}                 index [description]
   * @param    {[type]}                 label [description]
   * @return   {[type]}                       [description]
   */
  renderLabel(index, label) {
    const { masterData } = this.props;

    if (masterData.mains[index].newLabel) {
      return masterData.mains[index].newLabel;
    }

    if (index == 0) {
      this.index = 0;
    }

    if (masterData.mains[index].type == 'SPLITTER' || masterData.mains[index].type == 'RECALL') {
      this.index = this.index + 1;
      return;
    }

    if (index == 0) {
      return label;
    }
    return `${toChinesNum(Number(index) - this.index)}、${label}`;
  }

  renderDotTag = (item, mainIndex) => {
    const { masterData, paperData } = this.props;
    const { questions } = item;
    const jsx = [];
    const answerStatus = 0;
    if (item.type != 'SPLITTER' && item.type != 'RECALL') {
      for (const i in questions) {
        /**
         * 考中答题完成
         * @type {Object}
         */
        let paperInstance = {};
        let questionIds = [];
        if (item.index > 0) {
          paperInstance = paperData.paperInstance[item.index - 1];
          const { pattern } = paperData.paperInstance[item.index - 1];
          if (pattern.questionPatternType == 'NORMAL') {
            questionIds = [paperInstance.questions[i].id];
          } else if (pattern.questionPatternType == 'COMPLEX') {
            if (paperInstance.questions[0].data.groups[i].data.patternType === 'NORMAL') {
              questionIds = [paperInstance.questions[0].data.groups[i].id];
            } else {
              if (
                paperInstance.questions[0].data.groups[i].data &&
                paperInstance.questions[0].data.groups[i].data.subQuestion
              ) {
                paperInstance.questions[0].data.groups[i].data.subQuestion.forEach(element => {
                  questionIds.push(element.id);
                });
              }
            }
          } else {
            if (paperInstance.questions[i].data && paperInstance.questions[i].data.subQuestion) {
              paperInstance.questions[i].data.subQuestion.forEach(element => {
                questionIds.push(element.id);
              });
            }
          }
        }
        if (questions[i].pageSplit == 'Y') {
          jsx.push(
            <DotTag
              status={answerStatus}
              arr={questions[i].subs}
              className="marginLeft"
              data={questions[i]}
              questionType={item.type}
              mainIndex={mainIndex}
              questionIds={questionIds}
              focusIndex={masterData.staticIndex}
              index={this}
              key={`DotTag_${i}`}
            />
          );
          jsx.push(
            <div style={{ width: '163px', height: '1px', background: '#ccc', margin: '5px 0px' }} />
          );
        } else {
          jsx.push(
            <DotTag
              status={answerStatus}
              arr={questions[i].subs}
              className="marginLeft"
              data={questions[i]}
              questionType={item.type}
              mainIndex={mainIndex}
              questionIds={questionIds}
              focusIndex={masterData.staticIndex}
              index={this}
              key={`DotTag_${i}`}
            />
          );
        }
      }
      return (
        <div className="flex" style={{ flexWrap: 'wrap', marginLeft: '-4px' }}>
          {jsx}
        </div>
      );
    }
    if (item.type == 'SPLITTER') {
      return (
        <div className="flex">
          <DotTag
            status={questions[0].status}
            arr={['i']}
            data={questions[0]}
            questionType={item.type}
            mainIndex={mainIndex}
            focusIndex={masterData.staticIndex}
            index={this}
            key={`DotTags_${0}`}
          />
        </div>
      );
    }
  };

  renderContent() {
    const { masterData } = this.props;

    return (
      <div className="left-contents">
        {masterData.mains &&
          masterData.mains.map((item, index) => {
            if (index === 0) {
              return null;
            }
            return (
              <div key={`mains_${index}`}>
                <div className="title marginTop20-dot">{this.renderLabel(index, item.label)}</div>
                {this.renderDotTag(item, index)}
              </div>
            );
          })}
      </div>
    );
  }

  render() {
    return <div className={styles.siders}>{this.renderContent()}</div>;
  }
}

export default SiderMenu;
