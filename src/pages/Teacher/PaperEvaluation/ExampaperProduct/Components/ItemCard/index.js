/* eslint-disable eqeqeq */
import React, { PureComponent } from 'react';
import { FormattedMessage } from 'umi/locale';
import './index.less';
import QuestionShowCard from '../QuestionShowCard';
import { returnSubIndex } from '@/frontlib/utils/utils';
/*
  添加试题组件
  * @Author   tina.zhang
  * @DateTime  2018-10-17
  * @param     {[type]}    subIndex      二层题型序号
  * @param     {[type]}    mainIndex     大题序号
  * @param     {[type]}    questionIndex 小题序号
  * @param     {[type]}    focus         题目焦点
  * @param     {[type]}    showData      展示数据
  * @param     {[type]}    editData      编辑数据
  * @param     {[type]}    dataSource    保存数据
  * @param     {[type]}    beforeNum     复合题型此题之前小题序号
  * @param     {[type]}    masterData    主控数据
  * @param     {[type]}    type          题目类型
  * @param     {[type]}    paperId       试卷ID
 */

export default class ItemCard extends PureComponent {
  renderNoneQuestion() {
    const { questionIndex, beforeNum, type, masterData, subs } = this.props;
    if (subs) {
      return (
        <div className="questionSubs">
          {subs.map(item => (
            <div className="questionIndex marginTop">{item}</div>
          ))}
        </div>
      );
    }
    return (
      <div>
        <div className="questionIndex">
          {type == 'NORMAL' ? returnSubIndex(masterData, questionIndex - 1, 0) : beforeNum}
        </div>
      </div>
    );
  }

  render() {
    const {
      focus,
      subIndex,
      questionIndex,
      mainIndex,
      beforeNum,
      type,
      showData,
      dataSource,
      masterData,
      beforeNums,
      editData,
      paperId,
      invalidate,
      isExamine,
      ExampaperStatus,
      pattern,
      paperData,
    } = this.props;

    let itemQuestionIndex = questionIndex;
    const jsx = [];

    let className = 'addquestion-cards';
    if (focus == true) {
      className = 'addquestion-cards  addquestion-focus';
    }

    if (type == 'NORMAL') {
      itemQuestionIndex -= 1;
      if (dataSource[itemQuestionIndex] && dataSource[itemQuestionIndex].id) {
        jsx.push(
          <QuestionShowCard
            dataSource={dataSource[itemQuestionIndex]}
            showData={showData}
            editData={editData}
            titleData={pattern}
            paperID={paperId}
            isExamine={isExamine}
            masterData={masterData}
            paperData={paperData}
            invalidate={invalidate}
            patternType={type}
            type={type}
            questionCount={returnSubIndex(masterData, questionIndex - 1, 0)}
            mainIndex={mainIndex}
            questionIndex={questionIndex}
            subIndex={subIndex}
            key={`question_${dataSource[itemQuestionIndex].id}`}
            self={this}
            focus={focus}
            ExampaperStatus={ExampaperStatus}
            changeleftMeus={() => {
              // this.changeleftMeus(mainIndex, questionIndex, subIndex, type);
            }}
          />
        );
      }
    } else if (type == 'TWO_LEVEL') {
      if (dataSource[itemQuestionIndex] && dataSource[itemQuestionIndex].id) {
        jsx.push(
          <QuestionShowCard
            dataSource={dataSource[itemQuestionIndex]}
            showData={showData}
            editData={editData}
            paperData={paperData}
            titleData={pattern}
            paperID={paperId}
            isExamine={isExamine}
            masterData={masterData}
            patternType={type}
            invalidate={invalidate}
            type={type}
            questionCount={beforeNum}
            mainIndex={mainIndex}
            questionIndex={questionIndex}
            subIndex={subIndex}
            beforeNum={beforeNums}
            key={`question_${dataSource[itemQuestionIndex].id}`}
            self={this}
            focus={focus}
            ExampaperStatus={ExampaperStatus}
            changeleftMeus={() => {
              // this.changeleftMeus(mainIndex, questionIndex, subIndex, type);
            }}
          />
        );
      }
    } else if (type == 'COMPLEX') {
      itemQuestionIndex = 0;
      if (dataSource[0] && dataSource[0].id) {
        jsx.push(
          <QuestionShowCard
            dataSource={dataSource[0]}
            showData={showData}
            editData={editData}
            titleData={pattern}
            masterData={masterData}
            paperData={paperData}
            invalidate={invalidate}
            paperID={paperId}
            isExamine={isExamine}
            type={type}
            questionCount={beforeNum}
            mainIndex={mainIndex}
            questionIndex={questionIndex}
            subIndex={subIndex}
            beforeNum={beforeNums}
            key={`question_${dataSource[itemQuestionIndex].id}`}
            self={this}
            focus={focus}
            ExampaperStatus={ExampaperStatus}
            changeleftMeus={() => {
              // this.changeleftMeus(mainIndex, questionIndex, subIndex, type);
            }}
          />
        );
      }
    }

    // let isExamine = localStorage.getItem('isExamine');
    return (
      <div className={className}>
        {dataSource[itemQuestionIndex] && dataSource[itemQuestionIndex].id ? (
          jsx
        ) : (
          <div>
            {this.renderNoneQuestion()}
            {isExamine == '0' && (
              <div className="addquestion-flex">
                <div
                  className="questionbtn"
                  style={masterData.allowChooseQuestion == 'Y' ? {} : { width: '100%' }}
                >
                  <FormattedMessage id="app.question.edit" defaultMessage="添加题目" />
                </div>
                {masterData.allowChooseQuestion == 'Y' && (
                  <div className="questionbtn">
                    <FormattedMessage id="app.question.library" defaultMessage="题库选题" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
