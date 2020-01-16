/* eslint-disable consistent-return */
/* eslint-disable no-shadow */
/* eslint-disable guard-for-in */
/* eslint-disable eqeqeq */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-case-declarations */
import React, { Component } from 'react';
import cs from 'classnames';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';
import { fromCharCode } from '@/frontlib/utils/utils';
import AutoPlay from '@/frontlib/components/ExampaperProduct/Components/AutoPlay';

const messages = defineMessages({
  CheckAnswerBtn: { id: 'app.check.answer.btn', defaultMessage: '答案' },
  ReferenceReMark: { id: 'app.reference.by.remark', defaultMessage: '机评标注' },
  AudioExample: { id: 'app.audio.example', defaultMessage: '示范朗读' },
  ReferenceAnswerlabel: { id: 'app.ref erence.answerlabel', defaultMessage: '参考答案' },
  ReferenceAnswerlabelTips: { id: 'app.reference.answerlabeltip', defaultMessage: '提示答案' },
  ReferenceAnswerlabelError: { id: 'app.reference.answerlabelerror', defaultMessage: '错误答案' },
  keywordsExclude: { id: 'app.reference.keywordsExclude', defaultMessage: '评分关键词' },
  keywordsunExclude: { id: 'app.reference.keywordsunExclude', defaultMessage: '排除关键词' },
  weight: { id: 'app.reference.keywordsweight', defaultMessage: '权重' },
  closeBtn: { id: 'app.close.btn', defaultMessage: '关闭' },
});
/**
 * 答案
 */
class AnswersModal extends Component {
  componentDidMount() {}

  /**
   * @Author   tina.zhang
   * @DateTime  2018-11-02
   * @copyright 返回小题序号
   * @return    {[type]}    [description]
   */
  returnSubIndex = (masterData, index) => Number(masterData) + index;

  /**
   *  input 框处理
   */
  handlePaperHeadName = () => {};

  handleNavTime = () => {};

  renderContent = dataSource => {
    const { patternType } = dataSource;
    let jsx = [];
    switch (patternType) {
      case 'NORMAL':
        const maindata = dataSource.mainQuestion;
        jsx = this.renderAnswer(maindata, 0);

        return jsx;
      case 'TWO_LEVEL':
        const subsdata = dataSource.subQuestion;
        const { subIndex } = this.props;
        if (typeof subIndex != 'undefined') {
          // 线上平台老师报告页
          jsx = this.renderAnswer(subsdata[subIndex], Number(subIndex));
        } else {
          jsx = subsdata.map((item, index) => this.renderAnswer(item, index));
        }

        return jsx;
      default:
        return jsx;
    }
  };

  renderAnswer = (data, index) => {
    const { modelStatus, report, masterData } = this.props;
    let questionsNumber = `${this.returnSubIndex(masterData, index)}`;
    if (questionsNumber.trim() != '' && questionsNumber.trim() !== '0') {
      questionsNumber += '.';
    } else {
      questionsNumber = '';
    }
    if (report) {
      questionsNumber = ''; // ricky 1.3需求：报告页去掉答案前面的题号
    }

    let validateStyle = {};

    validateStyle = {
      background: '#F5F5F5',
      padding: '10px 10px',
    };

    const lineJsx = (
      <div className={styles.lineOutside}>
        <div className={styles.line} />
      </div>
    );

    switch (data.answerType) {
      case 'GAP_FILLING': // 填空题
        const answersText = [];
        for (const i in data.gapFillingQuestionAnswerInfo.answers) {
          answersText.push(data.gapFillingQuestionAnswerInfo.answers[i].text);
        }
        return (
          <div>
            <div>{questionsNumber}</div>
            <div style={validateStyle}>
              {answersText.length === 0 ? (
                <div>{formatMessage({ id: 'app.text.noAnswer', defaultMessage: '暂无答案' })}</div>
              ) : (
                <div>
                  {`${formatMessage({
                    id: 'app.text.da',
                    defaultMessage: '答案',
                  })}：${answersText.join(', ')}`}
                </div>
              )}
              {data.answerExplanation && lineJsx}
              {data.answerExplanation && (
                <div className={styles.answerTipsName}>
                  <div className={styles.answerTips}>
                    {formatMessage({ id: 'app.question.tips', defaultMessage: '点拨' })}
                  </div>
                  <div className={styles.answerTip2} />
                  <div style={{ width: '90%' }}>{data.answerExplanation}</div>
                </div>
              )}
            </div>
          </div>
        );

      // 选择
      case 'CHOICE':
        const answerOptions = data.choiceQuestionAnswerInfo.options;
        for (const i in answerOptions) {
          if (answerOptions[i].isAnswer == 'Y') {
            return (
              <div>
                {questionsNumber}
                <div style={validateStyle}>
                  <div>
                    <span>
                      {`${formatMessage({
                        id: 'app.text.da',
                        defaultMessage: '答案',
                      })}：${fromCharCode(Number(i) + 1)}`}
                    </span>
                  </div>
                  {data.answerExplanation && lineJsx}
                  {data.answerExplanation && (
                    <div className={styles.answerTipsName}>
                      <div className={styles.answerTips}>
                        {formatMessage({ id: 'app.question.tips', defaultMessage: '点拨' })}
                      </div>
                      <div className={styles.answerTip2} />
                      <div style={{ width: '90%' }}>{data.answerExplanation}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          }
        }
        break;
      case 'CLOSED_ORAL':
        const closeOralAnswer = data.closeOralQuestionAnswerInfo;
        return (
          <div className={styles.marginTop20}>
            {questionsNumber}
            {closeOralAnswer.referenceAudio ? (
              <div className={styles.marginTop10} style={validateStyle}>
                <div className={styles.marginTop10}>{formatMessage(messages.AudioExample)}</div>
                <AutoPlay id={closeOralAnswer.referenceAudio} />
              </div>
            ) : (
              <div>{formatMessage({ id: 'app.text.noAnswer', defaultMessage: '暂无答案' })}</div>
            )}
            {closeOralAnswer.referenceAudio && data.answerExplanation && lineJsx}
            {data.answerExplanation && (
              <div className={styles.answerTipsName} style={validateStyle}>
                <div className={styles.answerTips}>
                  {formatMessage({ id: 'app.question.tips', defaultMessage: '点拨' })}
                </div>
                <div className={styles.answerTip2} />
                <div style={{ width: '90%' }}>{data.answerExplanation}</div>
              </div>
            )}
          </div>
        );

      // 口语开放
      case 'OPEN_ORAL':
        const OpenAnswer = data.openOralQuestionAnswerInfo;
        const Openanswer2 = OpenAnswer.referenceAnswer;

        return (
          <div className={styles.marginTop20}>
            <div className={styles.marginTop10}>
              {questionsNumber}
              <div style={validateStyle}>{formatMessage(messages.ReferenceAnswerlabel)}</div>
              {Openanswer2.map((item, index) => {
                if (index > 4) return; // 最多显示5个参考答案
                return (
                  <div style={validateStyle}>
                    &nbsp;&nbsp;
                    {Number(index) + 1}
                    .&nbsp;
                    {item}
                  </div>
                );
              })}
              {Openanswer2.length === 0 && (
                <div>{formatMessage({ id: 'app.text.noAnswer', defaultMessage: '暂无答案' })}</div>
              )}
            </div>
            {data.answerExplanation && lineJsx}
            {data.answerExplanation && (
              <div className={styles.answerTipsName} style={validateStyle}>
                <div className={styles.answerTips}>
                  {formatMessage({ id: 'app.question.tips', defaultMessage: '点拨' })}
                </div>
                <div className={styles.answerTip2} />
                <div style={{ width: '90%', color: '#333' }}>{data.answerExplanation}</div>
              </div>
            )}
          </div>
        );
      // 口语半开放
      case 'HALF_OPEN_ORAL':
        const halfOpenAnswer = data.halfOpenOralQuestionAnswerInfo;
        const answer2 = halfOpenAnswer.referenceAnswer;
        return (
          <div className={styles.marginTop20}>
            <div>
              {questionsNumber}
              <div style={validateStyle}>{formatMessage(messages.ReferenceAnswerlabel)}</div>
              {answer2.map((item, index) => {
                if (index > 4) return;
                return (
                  <div className={modelStatus === 'VALIDATE' && styles.black} style={validateStyle}>
                    &nbsp;&nbsp;
                    {Number(index) + 1}
                    .&nbsp;
                    {item}
                  </div>
                );
              })}
              {answer2.length === 0 && (
                <div>{formatMessage({ id: 'app.text.noAnswer', defaultMessage: '暂无答案' })}</div>
              )}
            </div>
            {data.answerExplanation && lineJsx}

            {data.answerExplanation && (
              <div className={styles.answerTipsName} style={validateStyle}>
                <div className={styles.answerTips}>
                  {formatMessage({ id: 'app.question.tips', defaultMessage: '点拨' })}
                </div>
                <div className={styles.answerTip2} />
                <div style={{ width: '90%', color: '#333' }}>{data.answerExplanation}</div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  render() {
    const { dataSource } = this.props;
    return (
      <div>
        <div>
          <div className={styles.up} />
          <div className={styles.answer}>
            <div className={cs(styles.answerContent, 'answerContent')}>
              {this.renderContent(dataSource)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AnswersModal;
