/* eslint-disable no-prototype-builtins */
/* eslint-disable prefer-const */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-loop-func */
/* eslint-disable no-lone-blocks */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-useless-return */
/* eslint-disable array-callback-return */
/* eslint-disable no-shadow */
/* eslint-disable eqeqeq */
/* eslint-disable no-empty */
/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
/* eslint-disable default-case */
/* eslint-disable camelcase */
import React, { PureComponent } from 'react';
import { Radio } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import styles from './index.less';
import AutoPlay from '@/frontlib/components/ExampaperProduct/Components/AutoPlay';
import StemImage from './StemImage';
import StemVideo from './StemVideo';
import StemVideoText from './StemVideoText';
import SubQuestionAnswerArea from './SubQuestionAnswerArea';
import IconButton from '@/frontlib/components/IconButton';

import {
  fromCharCode,
  IsEmpty,
  returnSubIndex,
  CHOICEPICTUREWIDTH,
  CHOICEPICTUREHEIGHT,
  DoWithNum,
  checkTempStr,
  scoringMachine,
  calculatScore,
  IfLevel,
} from '@/frontlib/utils/utils';

import right_icon from '@/frontlib/assets/qus_right_icon.png';
import wrong_icon from '@/frontlib/assets/qus_wrong_icon.png';
import Analysis from '@/frontlib/components/ExampaperProduct/Components/AnalysisModal';
import emitter from '@/utils/ev';
import AnswersModal from './AnswersModal';

const RadioGroup = Radio.Group;
/**
 * 题目展示组件
 *
 */

@connect(({ paperEvaluation }) => ({
  studentId: paperEvaluation.studentId,
  studentAnswer: paperEvaluation.studentAnswer,
  isCanSee: paperEvaluation.isCanSee,
}))
class QuestionShowCard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      showDetail: false,
    };
    this.falg = false;
  }

  componentDidMount() {}

  componentWillUnmount() {}

  /**
   * @Author   tina.zhang
   * @DateTime  2018-10-25
   * @copyright 编辑题目
   * @return    {[type]}    [description]
   */
  editQuestion = () => {};

  /**
   * @Author   tina.zhang
   * @DateTime  2018-10-25
   * @copyright 答题区域渲染
   * @param     {[type]}    data  题目渲染数据
   * @param     {[type]}    index 题序
   * @return    {[type]}          [description]
   */
  renderAnswer = (displaySize, data, index, showData = undefined, allowMultiAnswerMode = 'N') => {
    switch (data.answerType) {
      case 'GAP_FILLING': // 填空题
        if (data.gapFillingQuestionAnswerInfo.gapFloatMode == 'HORIZENTAL') {
          this.subStyle = 'flex';
        }
        if (data.gapFillingQuestionAnswerInfo.gapMode == 'UNIQUE') {
          return (
            <SubQuestionAnswerArea
              key={index + data.isRight}
              index={index}
              subStyle={this.subStyle}
              // value={data.answerValue}
              // isRight={data.isRight}
              gapMode
              allowMultiAnswerMode={allowMultiAnswerMode}
              changeleftMeus={() => {
                // this.props.changeleftMeus();
              }}
              callback={e => {
                // data.answerValue = e;
                // data.gapAnswerValue = e;
              }}
              callbackBlur={e => {
                if (showData && showData.structure.flowInfo.allowMultiAnswerMode == 'Y') {
                  // 合并答题有提交按钮
                } else {
                  // this.submitAnswer();
                }
              }}
            />
          );
        }
        return (
          <SubQuestionAnswerArea
            key={index + data.isRight}
            index={index}
            // value={data.answerValue}
            // isRight={data.isRight}
            subStyle={this.subStyle}
            allowMultiAnswerMode={allowMultiAnswerMode}
            changeleftMeus={() => {
              // this.props.changeleftMeus();
            }}
            callback={e => {
              // data.answerValue = e;
              // data.gapAnswerValue = e;
            }}
            callbackBlur={e => {
              // this.submitAnswer();
            }}
          />
        );

      // 选择
      case 'CHOICE':
        const option = data.choiceQuestionAnswerInfo.options;
        if (IsEmpty(option)) {
          return;
        }
        if (Object.prototype.toString.call(displaySize) === '[Object Object]') {
          if (displaySize.width) {
          } else {
            displaySize.width = CHOICEPICTUREWIDTH;
          }
          if (displaySize.height) {
          } else {
            displaySize.height = CHOICEPICTUREHEIGHT;
          }
        } else {
          displaySize = { width: CHOICEPICTUREWIDTH, height: CHOICEPICTUREHEIGHT };
        }

        let width;
        if (data.choiceQuestionAnswerInfo.floatMode == 'VERTICAL') {
          width = { width: '100%' };
        }
        const jsx = option.map((item, index) => {
          if (item.text) {
            return (
              <Radio value={item.id} key={item.id} className={styles.choosetext} style={width}>
                {`${fromCharCode(index + 1)}. ${`${item.text}`.trim()}`}
                &nbsp;&nbsp;&nbsp;
                {data.answerId && data.answerId == item.id && data.isRight && (
                  <img src={right_icon} alt="" />
                )}
                {data.answerId && data.answerId == item.id && !data.isRight && (
                  <img src={wrong_icon} alt="" />
                )}
              </Radio>
            );
          }
          if (item.image) {
            return (
              <Radio value={item.id} key={item.id} className={styles.chooseimage} style={width}>
                <div className="stemImageflex">
                  <div>{`${fromCharCode(index + 1)}. `}</div>
                  <StemImage
                    id={item.image}
                    className="stemImage_little"
                    style={displaySize}
                    key={item.image}
                    customStyle={{ padding: '0px 10px', justifyContent: 'flex-start' }}
                  />
                  {data.answerId && data.answerId == item.id && data.isRight && (
                    <img src={right_icon} alt="" />
                  )}
                  {data.answerId && data.answerId == item.id && !data.isRight && (
                    <img src={wrong_icon} alt="" />
                  )}
                </div>
              </Radio>
            );
          }
        });

        return (
          <RadioGroup
            value={data.answerId}
            style={{ marginTop: 10 }}
            onChange={e => {
              const self = this;
            }}
          >
            {jsx}
          </RadioGroup>
        );
      // 口语封闭
      case 'CLOSED_ORAL':
        return;
      // 口语开放
      case 'OPEN_ORAL':
        return;
      // 口语半开放
      case 'HALF_OPEN_ORAL':
        return;
    }
  };

  /**
   * @Author   tina.zhang
   * @DateTime  2018-10-25
   * @copyright 答按区域
   * @param     {[type]}    data  题目渲染数据
   * @param     {[type]}    index 题序
   * @return    {[type]}          [description]
   */
  renderBeforeAnswer = data => {
    let jsx;
    if (data.patternType == 'TWO_LEVEL') {
      jsx = data.subQuestion.map((item, index) => (
        <SubQuestionAnswerArea index={index + 1} value={item.answerValue} disabled />
      ));
    } else {
      jsx = <SubQuestionAnswerArea index={1} value={data.mainQuestion.answerValue} disabled />;
    }

    return <div style={{ display: 'flex', flexWrap: 'wrap' }}>{jsx}</div>;
  };

  /**
   * @Author   tina.zhang
   * @DateTime  2018-11-28
   * @copyright 换行文本
   * @param     {[type]}    value [description]
   * @return    {[type]}          [description]
   */
  splitText = value => {
    if (value) {
      const stemText = value.split('\n');
      const jsx = stemText.map((item, index) => (
        <div className={checkTempStr(value) ? styles.card_content : styles.card_content_normal}>
          {item}
        </div>
      ));
      return jsx;
    }
  };

  /**
   * @Author   tina.zhang
   * @DateTime  2018-10-25
   * @copyright 小题主题干部分渲染 包含普通，二层
   * @param     {[type]}    newData  [description]
   * @param     {[type]}    mainData [description]
   * @param     {[type]}    jsx      [description]
   * @return    {[type]}             [description]
   */
  mainQuestionItem = (newData, mainData, jsx, componentsConfig = []) => {
    const { questionCount, type, focus, dataSource, masterData } = this.props;
    let num = '';
    if (type == 'NORMAL' && questionCount && questionCount.trim() != '') {
      num = `${questionCount}. `;
    } else {
      num = '';
    }
    let questionCountFlag = true; // 题号是否已经展示
    for (const i in newData) {
      if (newData[i].components) {
        if (newData[i].components && newData[i].components.audioButton) {
          // 音频播放图标
          if (
            newData[i].components.audioButton == 'stemAudio' &&
            mainData.mainQuestion.stemAudio2 != undefined &&
            mainData.mainQuestion.stemAudio2 != null &&
            mainData.mainQuestion.stemAudio2 != ''
          ) {
            jsx.push(
              <AutoPlay
                evaluations
                id={mainData.mainQuestion[newData[i].components.audioButton]}
                id2={mainData.mainQuestion.stemAudio2}
                text={mainData.mainQuestion[newData[i].components.textButton]}
                key={
                  mainData.mainQuestion.stemAudio2
                    ? `AutoPlay_${mainData.mainQuestion.stemAudio2}`
                    : `AutoPlay_${mainData.mainQuestion[newData[i].components.audioButton]}`
                }
                evaluations
                focus={focus}
                isQuestionCard
                focusId={this.state.id}
                callback={id => {
                  // if(id != mainData.mainQuestion[newData[i].components.audioButton]){
                  this.setState({ id });
                  // }
                }}
              />
            );
          } else if (mainData.mainQuestion[newData[i].components.audioButton]) {
            jsx.push(
              <AutoPlay
                evaluations
                id={mainData.mainQuestion[newData[i].components.audioButton]}
                text={mainData.mainQuestion[newData[i].components.textButton]}
                key={`AutoPlay_${mainData.mainQuestion[newData[i].components.audioButton]}`}
                focus={focus}
                isQuestionCard
                focusId={this.state.id}
                callback={id => {
                  // if(id != mainData.mainQuestion[newData[i].components.audioButton]){
                  this.setState({ id });
                  // }
                }}
              />
            );
          }
        }
        if (newData[i].components.name == 'answerBeforeArea') {
          if (type == 'COMPLEX') {
            if (masterData.staticIndex.questionIndex > 0) {
              for (let a = 0; a < masterData.staticIndex.questionIndex; a++) {
                if (dataSource.data.groups[a].data.mainQuestion.answerType == 'GAP_FILLING') {
                  if (
                    (componentsConfig[a].structure &&
                      componentsConfig[a].structure.viewInfo.showAnswerAfter) == 'Y'
                  ) {
                    jsx.push(this.renderBeforeAnswer(dataSource.data.groups[a].data));
                  }
                }
              }
            }
          }
        } else if (newData[i].components.name == 'stemVideo') {
          // 主题干视频
          if (questionCountFlag) {
            questionCountFlag = false;
            jsx.push(
              <span className={styles.card_content} style={{ marginTop: '10px' }}>
                {num}&nbsp;
              </span>
            );
          }
          if (mainData.mainQuestion[newData[i].components.name]) {
            if (
              newData[i].components.textButton === 'stemVideoText' &&
              mainData.mainQuestion[newData[i].components.textButton] != '' &&
              mainData.mainQuestion[newData[i].components.textButton] != null
            ) {
              jsx.push(
                <StemVideoText
                  text={mainData.mainQuestion[newData[i].components.textButton]}
                  key={`AutoPlay_${mainData.mainQuestion[newData[i].components.textButton]}`}
                  isQuestionCard
                  style={{ marginTop: '10px' }}
                  callback={id => {}}
                />
              );
            }
            jsx.push(
              <StemVideo
                id={mainData.mainQuestion[newData[i].components.name]}
                key={
                  mainData.mainQuestion[newData[i].components.name] +
                  masterData.staticIndex.questionIndex
                }
                style={newData[i].components.displaySize}
              />
            );
          }
        } else if (newData[i].components.name == 'stemImage') {
          if (questionCountFlag) {
            questionCountFlag = false;
            jsx.push(<span className={styles.card_content}>{num}&nbsp;</span>);
          }
          // 主题干图片
          if (mainData.mainQuestion[newData[i].components.name]) {
            jsx.push(
              <StemImage
                id={mainData.mainQuestion[newData[i].components.name]}
                key={mainData.mainQuestion[newData[i].components.name]}
                style={newData[i].components.displaySize}
              />
            );
          }
        } else if (newData[i].components.name == 'stemAudioSpace') {
          if (questionCountFlag) {
            questionCountFlag = false;
            jsx.push(<span className={styles.card_content}>{num}&nbsp;</span>);
          }
          // 展示空白区域，作用是占位。
          jsx.push(<div className={styles.stemAudioSpace} />);
        } else if (newData[i].components.name == 'guidePrefixText') {
          // 题前指导文本
          jsx.push(
            <div className={styles.card_title}>
              {this.splitText(mainData.mainQuestion[newData[i].components.name])}
            </div>
          );
        } else if (newData[i].components.name == 'guideMiddleText') {
          // 中间指导文本
          jsx.push(
            <div className={styles.card_title}>
              {this.splitText(mainData.mainQuestion[newData[i].components.name])}
            </div>
          );
        } else if (newData[i].components.name == 'guideSuffixText') {
          // 题后指导文本
          jsx.push(
            <div className={styles.card_title}>
              {this.splitText(mainData.mainQuestion[newData[i].components.name])}
            </div>
          );
        } else if (newData[i].components.name == 'guidePrefixImage') {
          // 题前指导图片
          if (mainData.mainQuestion[newData[i].components.name]) {
            jsx.push(
              <StemImage
                id={mainData.mainQuestion[newData[i].components.name]}
                key={mainData.mainQuestion[newData[i].components.name]}
                style={newData[i].components.displaySize}
              />
            );
          }
        } else if (newData[i].components.name == 'guideMiddleImage') {
          // 中间指导图片
          if (mainData.mainQuestion[newData[i].components.name]) {
            jsx.push(
              <StemImage
                id={mainData.mainQuestion[newData[i].components.name]}
                key={mainData.mainQuestion[newData[i].components.name]}
                style={newData[i].components.displaySize}
              />
            );
          }
        } else if (newData[i].components.name == 'guideSuffixImage') {
          // 中间指导图片
          if (mainData.mainQuestion[newData[i].components.name]) {
            jsx.push(
              <StemImage
                id={mainData.mainQuestion[newData[i].components.name]}
                key={mainData.mainQuestion[newData[i].components.name]}
                style={newData[i].components.displaySize}
              />
            );
          }
        } else if (newData[i].components.name == 'answerArea') {
          // 答案区域 todo...
          jsx.push(
            this.renderAnswer(newData[i].components.displaySize, mainData.mainQuestion, num)
          );
        } else if (newData[i].components.name == 'stemAudio') {
          // 音频图标占位，当题干文本或图片存在时，不用展示；只有在没有题干文本/图片的时候展示
          let stemAudioFalg = true;
          let stemImageFalg = true;
          let stemVideoFalg = true;

          for (const j in newData) {
            if (newData[j].components) {
              if (newData[j].components.name == 'stemText') {
                stemAudioFalg = false;
              }
              if (newData[j].components.name == 'stemImage') {
                stemImageFalg = false;
              }

              if (newData[j].components.name == 'stemVideo') {
                stemVideoFalg = false;
              }

              if (
                newData[j].components.name == 'stemText' &&
                (mainData.mainQuestion.stemText == null || mainData.mainQuestion.stemText === '')
              ) {
                stemAudioFalg = true;
              }

              if (
                newData[j].components.name == 'stemImage' &&
                (mainData.mainQuestion.stemImage == null || mainData.mainQuestion.stemImage === '')
              ) {
                stemImageFalg = true;
              }

              if (
                newData[j].components.name == 'stemVideo' &&
                (mainData.mainQuestion.stemVideo == null || mainData.mainQuestion.stemVideo === '')
              ) {
                stemVideoFalg = true;
              }
            }
          }
          if (stemAudioFalg && stemImageFalg && stemVideoFalg) {
            jsx.push(
              <div className="stemAudioTop" style={{ display: 'flex' }}>
                {questionCountFlag && <span className={styles.card_content}>{num}&nbsp;</span>}
                <AutoPlay />
              </div>
            );
            if (questionCountFlag) {
              questionCountFlag = false;
            }
          }
        } else if (newData[i].components.name == 'stemText') {
          // 主题干文本
          let stemText = '';

          if (mainData.mainQuestion[newData[i].components.name]) {
            stemText = mainData.mainQuestion[newData[i].components.name].split('\n');
          } else {
            stemText = [];
          }
          let speStyles = {};
          if (
            mainData.mainQuestion &&
            mainData.mainQuestion.evaluationEngineInfo &&
            mainData.mainQuestion.evaluationEngineInfo.evaluationEngine === 'eval.word.en'
          ) {
            speStyles = { fontFamily: 'Arial' };
          }
          if (stemText.length == 1) {
            // 短文前面空2格
            const spanJsx = [];
            const len = stemText[0].split('  ').length - 1;
            for (let p = 0; p < len; p++) {
              spanJsx.push(<span className={styles.card_content}>&nbsp;&nbsp;</span>);
            }
            jsx.push(
              <div
                className={
                  checkTempStr(stemText[0]) ? styles.card_content : styles.card_content_normal
                }
                style={speStyles}
              >
                <span className={styles.card_content}>{questionCountFlag ? num : ''}</span>
                {spanJsx}
                {stemText[0]}
              </div>
            );
            if (questionCountFlag) {
              questionCountFlag = false;
            }
          } else {
            {
              stemText.map((item, index) => {
                // 短文前面空2格
                const spanJsx = [];
                const len = item.split('  ').length - 1;
                for (let p = 0; p < len; p++) {
                  spanJsx.push(
                    <span className={styles.card_content}>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                  );
                }
                jsx.push(
                  <div
                    className={
                      checkTempStr(mainData.mainQuestion[newData[i].components.name])
                        ? styles.card_content
                        : styles.card_content_normal
                    }
                  >
                    {spanJsx}
                    {item}
                  </div>
                );
              });
            }
          }
        }
      }
    }
    return jsx;
  };

  /**
   * @Author   tina.zhang
   * @DateTime  2018-11-22
   * @copyright 封闭题型答题后的分析（朗读短文...）
   * @param     {[type]}    mainData [description]
   * @param     {[type]}    res      [description]
   * @param     {[type]}    jsx      [description]
   * @param     {[type]}    name     [description]
   * @return    {[type]}             [description]
   */
  analysis = (mainData, res, jsx, name) => {
    let text = mainData.mainQuestion[name];
    let referenceTextMark;
    if (mainData.mainQuestion.answerType == 'CLOSED_ORAL') {
      text = mainData.mainQuestion.answerValue.request.reference.answers.text;
      referenceTextMark = mainData.mainQuestion.closeOralQuestionAnswerInfo.referenceTextMark;
    }

    const textJsx = [];
    let rank = 100;
    if (mainData.mainQuestion.answerValue.request) {
      rank = mainData.mainQuestion.answerValue.request.rank;
    } else {
      rank = mainData.mainQuestion.answerValue.params.request.rank;
    }

    const score = 0;
    for (const m in res) {
      let color = '';
      // if (referenceTextMark) { //备注转换
      //   for (let i in referenceTextMark) {
      //     if (res[m].beginindex == referenceTextMark[i].convertStartIndex) {
      //       this.falg = true;
      //     } else if (res[m].endindex == referenceTextMark[i].convertEndIndex) {
      //       this.referenceTextMarkWord = referenceTextMark[i].word;
      //       score = res[m].score;
      //       this.falg = false;

      //     }
      //   }
      // }

      const details = res[m].details;
      for (const i in details) {
        if (rank == 100) {
          if (details[i].score >= 0 && details[i].score <= 54) {
            color = 'red';
          } else if (details[i].score >= 55 && details[i].score <= 69) {
            color = 'blue';
          } else if (details[i].score >= 70 && details[i].score <= 84) {
            color = 'orange';
          } else if (details[i].score >= 85 && details[i].score <= 100) {
            color = 'green';
          }
        } else if (details[i].score == 4) {
          color = 'green';
        } else if (details[i].score == 3) {
          color = 'orange';
        } else if (details[i].score == 2) {
          color = 'blue';
        } else if (details[i].score == 1) {
          color = 'red';
        } else if (details[i].score == 0) {
          color = 'red';
        }
        if (details[i].type == 7) {
          textJsx.push(<span className={styles[color]}>{details[i].text}&nbsp;</span>);
        } else {
          textJsx.push(<span className={styles[color]}>&nbsp;{details[i].text}&nbsp;</span>);
        }
      }
    }
    jsx.push(
      <div className={styles.card_content} style={{ display: 'flex', flexWrap: 'wrap' }}>
        {textJsx}
      </div>
    );
    return jsx;
  };

  /**
   * @Author   tina.zhang
   * @DateTime  2018-10-25
   * @copyright 子题渲染 二层子题
   * @param     {[type]}    showData [description]
   * @param     {[type]}    newData  [description]
   * @param     {[type]}    mainData [description]
   * @param     {[type]}    subJsx   [description]
   * @return    {[type]}             [description]
   */
  subQuestionItem = (showData, newData, mainData, subJsx) => {
    const {
      mainIndex,
      questionIndex,
      beforeNum,
      type,
      subIndex,
      dataSource,
      questionCount,
      focus,
      masterData,
    } = this.props;

    this.subStyle = '';
    let num = '';

    if (showData.structure.flowInfo.allowMultiAnswerMode == 'Y') {
      // 合并答题todo
      const cardJsx = [];
      for (const i in mainData.subQuestion) {
        const subCardJsx = [];

        const Stide = `${returnSubIndex(masterData, questionIndex, i)}`;
        if (Stide.trim() != '') {
          num = `${Stide}. `;
        }
        let questionCountFlag = true; // 题号是否已经展示
        for (const j in newData) {
          if (newData[j]) {
            if (newData[j].subComponents) {
              if (newData[j].subComponents.audioButton) {
                if (
                  newData[j].subComponents.audioButton == 'subQuestionStemAudio' &&
                  mainData.subQuestion[i].subQuestionStemAudio2 != undefined &&
                  mainData.subQuestion[i].subQuestionStemAudio2 != null
                ) {
                  subCardJsx.push(
                    <AutoPlay
                      id={mainData.subQuestion[i][newData[j].subComponents.audioButton]}
                      id2={mainData.subQuestion[i].subQuestionStemAudio2}
                      text={mainData.subQuestion[i][newData[j].subComponents.textButton]}
                      focus={focus}
                      focusId={this.state.id}
                      isQuestionCard
                      evaluations
                      key={
                        mainData.subQuestion[i].subQuestionStemAudio2
                          ? `AutoPlay_${mainData.subQuestion[i].subQuestionStemAudio2}${i}`
                          : `AutoPlay_${mainData.subQuestion[i].subQuestionStemAudio}${i}`
                      }
                      callback={id => {
                        // if(id != mainData.subQuestion[i][newData[j].subComponents.audioButton]){
                        this.setState({ id });
                        // }
                      }}
                    />
                  );
                } else {
                  subCardJsx.push(
                    <AutoPlay
                      id={mainData.subQuestion[i][newData[j].subComponents.audioButton]}
                      text={mainData.subQuestion[i][newData[j].subComponents.textButton]}
                      focus={focus}
                      focusId={this.state.id}
                      isQuestionCard
                      evaluations
                      key={`AutoPlay_${
                        mainData.subQuestion[i][newData[j].subComponents.audioButton]
                      }${i}`}
                      callback={id => {
                        // if(id != mainData.subQuestion[i][newData[j].subComponents.audioButton]){
                        this.setState({ id });
                        // }
                      }}
                    />
                  );
                }
              }
              if (newData[j].subComponents.name == 'subQuestionAnswerArea') {
                // 7.3.16   小题答案区域展示
                subCardJsx.push(
                  this.renderAnswer(
                    newData[j].subComponents.displaySize,
                    mainData.subQuestion[i],
                    num,
                    showData,
                    'Y'
                  )
                );
              } else if (newData[j].subComponents.name == 'subQuestionStemImage') {
                if (questionCountFlag) {
                  questionCountFlag = false;
                  subCardJsx.push(<span className={styles.card_content}>{num}&nbsp;</span>);
                }
                // 7.3.14  小题题干图片展示
                if (mainData.subQuestion[i][newData[j].subComponents.name]) {
                  subCardJsx.push(
                    <StemImage
                      id={mainData.subQuestion[i][newData[j].subComponents.name]}
                      style={newData[j].subComponents.displaySize}
                    />
                  );
                }
              } else if (newData[j].subComponents.name == 'subQuestionStemAudio') {
                // 7.3.15  小题题干音频展示
                // 音频图标占位，当题干文本或图片存在时，不用展示；只有在没有题干文本/图片的时候展示
                let stemAudioFalg = true;
                let stemImageFalg = true;

                for (const m in newData) {
                  if (newData[m].subComponents) {
                    if (newData[m].subComponents.name == 'subQuestionStemText') {
                      stemAudioFalg = false;
                    }

                    if (newData[m].subComponents.name == 'subQuestionStemImage') {
                      stemImageFalg = false;
                    }

                    if (
                      newData[m].subComponents.name == 'subQuestionStemText' &&
                      (mainData.subQuestion[i].subQuestionStemText == null ||
                        mainData.subQuestion[i].subQuestionStemText === '')
                    ) {
                      stemAudioFalg = true;
                    }

                    if (
                      newData[m].subComponents.name == 'subQuestionStemImage' &&
                      (mainData.subQuestion[i].subQuestionStemImage == null ||
                        mainData.subQuestion[i].subQuestionStemImage === '')
                    ) {
                      stemImageFalg = true;
                    }
                  }
                }
                if (stemAudioFalg && stemImageFalg) {
                  subCardJsx.push(
                    <div className="stemAudioTop" style={{ display: 'flex' }}>
                      {questionCountFlag && (
                        <span className={styles.card_content}>{num}&nbsp;</span>
                      )}
                      <AutoPlay />
                    </div>
                  );
                  if (questionCountFlag) {
                    questionCountFlag = false;
                  }
                }
              } else if (newData[j].subComponents.name == 'subQuestionStemText') {
                // "subQuestionStemText"
                subCardJsx.push(
                  <div className={styles.card_title} style={{ display: 'flex' }}>
                    <div
                      className={styles.card_content}
                      style={
                        checkTempStr(mainData.subQuestion[i][newData[j].subComponents.name])
                          ? { margin: '6px 0px' }
                          : { margin: '0px 0px' }
                      }
                    >
                      {questionCountFlag ? num : ''}&nbsp;
                    </div>
                    <div className={styles.card_content_normal}>
                      {this.splitText(mainData.subQuestion[i][newData[j].subComponents.name])}
                    </div>
                  </div>
                );

                if (questionCountFlag) {
                  questionCountFlag = false;
                }
              }
            }
          }
        }
        cardJsx.push(subCardJsx);
      }
      if (mainData.subQuestion[0].answerType == 'GAP_FILLING') {
        let myStyle = '';
        if (this.subStyle == 'flex') {
          myStyle = styles.flex;
        }
        subJsx.push(
          <div className="backs">
            <div className={styles.tips}>
              {formatMessage({ id: 'app.text.answerarea', defaultMessage: '请在以下区域作答' })}
            </div>
            <div className={myStyle}>{cardJsx}</div>
            {/* <div className="GAP_FILLING">
              <div className="button submit_GAP_FILLING">
                <span className="icontext" style={{ color: '#fff' }}>
                  {formatMessage({ id: 'app.button.submitquestion', defaultMessage: '提交本题' })}
                </span>
              </div>
            </div> */}
            {/* {mainData.totalPoints != undefined ? (
              <div className="GAP_FILLING">
                <div className={styles.scroe}>
                  <span className="icontext">
                    {formatMessage({ id: 'app.text.df', defaultMessage: '得分' })}:
                  </span>
                  <span className="icontext receivePoints">
                    {DoWithNum(mainData.receivePoints)}
                  </span>
                  <span className="icontext">
                    /
                    {formatMessage({
                      id: 'app.examination.inspect.task.detail.full.mark',
                      defaultMessage: '总分',
                    })}
                    :
                  </span>
                  <span className="icontext">{mainData.totalPoints}</span>
                </div>
              </div>
            ) : (
              ''
            )} */}
          </div>
        );
      } else {
        let myStyle = '';
        if (this.subStyle == 'flex') {
          myStyle = styles.flex;
        }
        subJsx.push(
          <div className="backs">
            <div className={myStyle}>{cardJsx}</div>
            {/* {mainData.totalPoints != undefined ? (
              <div className="GAP_FILLING">
                <div className={styles.scroe}>
                  <span className="icontext">
                    {formatMessage({ id: 'app.text.df', defaultMessage: '得分' })}:
                  </span>
                  <span className="icontext receivePoints">
                    {DoWithNum(mainData.receivePoints)}
                  </span>
                  <span className="icontext">
                    /
                    {formatMessage({
                      id: 'app.examination.inspect.task.detail.full.mark',
                      defaultMessage: '总分',
                    })}
                    :
                  </span>
                  <span className="icontext">{mainData.totalPoints}</span>
                </div>
              </div>
            ) : (
              ''
            )} */}
          </div>
        );
      }
    } else {
      // 非合并答题

      for (const i in mainData.subQuestion) {
        const subCardJsx = [];
        const Stide1 = `${returnSubIndex(masterData, questionIndex, i)}`;
        if (Stide1.trim() != '') {
          num = `${Stide1}. `;
        } else {
          num = '';
        }
        let questionCountFlag = true; // 题号是否已经展示
        // if (type == 'TWO_LEVEL') {
        //   num = beforeNum + Number(i) + 1 + '. ';
        // } else {
        //   num = Number(i) + 1 + '. ';
        // }
        for (const j in newData) {
          if (newData[j].subComponents) {
            if (newData[j].subComponents.audioButton) {
              if (
                newData[j].subComponents.audioButton == 'subQuestionStemAudio' &&
                mainData.subQuestion[i].subQuestionStemAudio2 != undefined &&
                mainData.subQuestion[i].subQuestionStemAudio2 != null
              ) {
                subCardJsx.push(
                  <AutoPlay
                    evaluations
                    id={mainData.subQuestion[i][newData[j].subComponents.audioButton]}
                    id2={mainData.subQuestion[i].subQuestionStemAudio2}
                    text={mainData.subQuestion[i][newData[j].subComponents.textButton]}
                    focus={focus}
                    focusId={this.state.id}
                    key={
                      mainData.subQuestion[i].subQuestionStemAudio2
                        ? `AutoPlay_${mainData.subQuestion[i].subQuestionStemAudio2}${i}`
                        : `AutoPlay_${mainData.subQuestion[i].subQuestionStemAudio}${i}`
                    }
                    isQuestionCard
                    callback={id => {
                      // if(id != mainData.subQuestion[i][newData[j].subComponents.audioButton]){
                      this.setState({ id });
                      // }
                    }}
                  />
                );
              } else {
                subCardJsx.push(
                  <AutoPlay
                    evaluations
                    id={mainData.subQuestion[i][newData[j].subComponents.audioButton]}
                    text={mainData.subQuestion[i][newData[j].subComponents.textButton]}
                    key={`AutoPlay_${
                      mainData.subQuestion[i][newData[j].subComponents.audioButton]
                    }`}
                    focusId={this.state.id}
                    focus={focus}
                    key={`AutoPlay_${
                      mainData.subQuestion[i][newData[j].subComponents.audioButton]
                    }`}
                    isQuestionCard
                    callback={id => {
                      // if(id != mainData.subQuestion[i][newData[j].subComponents.audioButton]){
                      this.setState({ id });
                      // }
                    }}
                  />
                );
              }
            }

            if (newData[j].subComponents.name == 'subQuestionAnswerArea') {
              subCardJsx.push(
                this.renderAnswer(
                  newData[j].subComponents.displaySize,
                  mainData.subQuestion[i],
                  num,
                  showData
                )
              );
            } else if (newData[j].subComponents.name == 'subQuestionStemImage') {
              if (questionCountFlag) {
                questionCountFlag = false;
                subCardJsx.push(<span className={styles.card_content}>{num}&nbsp;</span>);
              }
              // 7.3.14  小题题干图片展示
              subCardJsx.push(
                <StemImage
                  id={mainData.subQuestion[i][newData[j].subComponents.name]}
                  style={newData[j].subComponents.displaySize}
                />
              );
            } else if (newData[j].subComponents.name == 'subQuestionStemAudio') {
              // 7.3.15  小题题干音频展示
              // 音频图标占位，当题干文本或图片存在时，不用展示；只有在没有题干文本/图片的时候展示
              let stemAudioFalg = true;
              let stemImageFalg = true;

              for (const m in newData) {
                if (newData[m].subComponents) {
                  if (newData[m].subComponents.name == 'subQuestionStemText') {
                    stemAudioFalg = false;
                  }

                  if (newData[m].subComponents.name == 'subQuestionStemImage') {
                    stemImageFalg = false;
                  }

                  if (
                    newData[m].subComponents.name == 'subQuestionStemText' &&
                    (mainData.subQuestion[i].subQuestionStemText == null ||
                      mainData.subQuestion[i].subQuestionStemText === '')
                  ) {
                    stemAudioFalg = true;
                  }

                  if (
                    newData[m].subComponents.name == 'subQuestionStemImage' &&
                    (mainData.subQuestion[i].subQuestionStemImage == null ||
                      mainData.subQuestion[i].subQuestionStemImage === '')
                  ) {
                    stemImageFalg = true;
                  }
                }
              }
              if (stemAudioFalg && stemImageFalg) {
                subCardJsx.push(
                  <div className="stemAudioTop" style={{ display: 'flex' }}>
                    {questionCountFlag && <span className={styles.card_content}>{num}&nbsp;</span>}
                    <AutoPlay />
                  </div>
                );
                if (questionCountFlag) {
                  questionCountFlag = false;
                }
              }
            } else if (newData[j].subComponents.name == 'subQuestionStemText') {
              // "subQuestionStemText"

              subCardJsx.push(
                <div className={styles.card_title} style={{ display: 'flex' }}>
                  <div
                    className={styles.card_content}
                    style={
                      checkTempStr(mainData.subQuestion[i][newData[j].subComponents.name])
                        ? { margin: '6px 0px' }
                        : { margin: '0px 0px' }
                    }
                  >
                    {questionCountFlag ? num : ''}&nbsp;
                  </div>
                  <div className={styles.card_content_normal}>
                    {this.splitText(mainData.subQuestion[i][newData[j].subComponents.name])}
                  </div>
                </div>
              );

              if (questionCountFlag) {
                questionCountFlag = false;
              }
            }
          }
        }

        subJsx.push(
          <div
            className={
              subIndex == returnSubIndex(masterData, questionIndex, i) ? 'backs' : 'nobacks'
            }
          >
            {subCardJsx}

            {/* {mainData.subQuestion[i].totalPoints != undefined ? (
              <div className="GAP_FILLING">
                <div className={styles.scroe}>
                  <span className="icontext">
                    {formatMessage({ id: 'app.text.df', defaultMessage: '得分' })}:
                  </span>
                  <span className="icontext receivePoints">
                    {DoWithNum(mainData.subQuestion[i].receivePoints)}
                  </span>
                  <span className="icontext">
                    /{formatMessage({ id: 'app.total.proper', defaultMessage: '总分' })}:
                  </span>
                  <span className="icontext">{mainData.subQuestion[i].totalPoints}</span>
                </div>
              </div>
            ) : (
              ''
            )} */}
          </div>
        );
      }
    }

    return subJsx;
  };

  // 开关详情页面
  toggleDetailPage = () => {
    const { showDetail } = this.state;
    this.setState({
      showDetail: !showDetail,
    });
  };

  // 学生详情页，再试卷中加入答题结果
  getStudentReport = questionIndexData => {
    const { questionIndex, mainIndex, dataSource, paperData } = this.props;
    let score;
    let res;
    let subIndex = [];
    const masterData = {
      staticIndex: {
        mainIndex: Number(mainIndex),
        questionIndex,
      },
    };
    score = calculatScore(masterData.staticIndex, paperData);
    subIndex = this.getStudentAnswer(questionIndexData);

    if (subIndex.length > 0) {
      this.numberSub = subIndex.length;
      subIndex.map(item => {
        res = scoringMachine(
          masterData,
          questionIndexData,
          score,
          dataSource,
          undefined,
          undefined,
          item
        );
      });
    }
  };

  // 将学生答案拼接到试卷里-筛选小题id
  getStudentAnswer = questionIndexData => {
    const { dataSource, type, questionIndex } = this.props;
    let patternType = questionIndexData.patternType;
    let data = dataSource;
    let i = [];
    if (type == 'COMPLEX') {
      patternType = dataSource.data.groups[questionIndex].data.patternType;
      data = dataSource.data.groups[questionIndex];
    }
    if (patternType == 'TWO_LEVEL') {
      questionIndexData.subQuestion.map((Item, index) => {
        if (this.getAnswer(Item, Item.id)) {
          i.push(index);
        }
      });
    } else if (patternType == 'NORMAL') {
      if (this.getAnswer(questionIndexData.mainQuestion, data.id)) {
        i.push(0);
      }
    }
    return i;
  };

  // 拼接实际数据
  getAnswer = (Item, id) => {
    let num = {
      // 选择题换算成Id
      A: 0,
      B: 1,
      C: 2,
      D: 3,
      E: 4,
      F: 5,
      G: 6,
      H: 7,
      I: 8,
      J: 9,
      K: 10,
    };
    let type = Item.answerType;
    let data = this.findAnswer(id);
    if (data) {
      if (type === 'CHOICE') {
        if (data.studentAnswers !== 'server.wzd' && data.studentAnswers !== null) {
          if (data.answerOptionOrder) {
            let list = data.answerOptionOrder.split(',');
            let index = -1;
            for (let i = 0; i < list.length; i++) {
              if (num[data.studentAnswers] == Number(list[i])) {
                index = i;
              }
            }
            if (index > -1) {
              Item.answerId = Item.choiceQuestionAnswerInfo.options[index].id;
            }
          } else {
            Item.answerId = Item.choiceQuestionAnswerInfo.options[num[data.studentAnswers]].id;
          }
        }
      } else if (type == 'GAP_FILLING') {
        Item.answerValue = data.studentAnswers === 'server.wzd' ? '未作答' : data.studentAnswers;
      } else {
        // 临时方案，因为人工纠偏，口语题分数要显示人工调整后的分数
        if (data && data.engineResult) {
          if (!data.engineResult.result) {
            data.engineResult = JSON.parse(data.engineResult);
          }
        }
        if (data && data.engineResult && data.engineResult.result) {
          // let rank=Number(data.engineResult.result.rank);
          // let Loverall=GetLevel((Number(data.engineResult.result.overall)/rank)*100)
          // let Lscore=GetLevel((DoWithNum(data.score)/rank)*100)
          // let offset=Lscore-Loverall;//偏移等级，用于调整分数细节
          let offset = data.offset || 0; // 获取得分偏差
          if (!data.engineResult.result.hasOwnProperty('offset')) {
            data.engineResult.result.offset = offset;
            // 修改口语题原数据
            data.engineResult.result.overall = DoWithNum(data.score); // 总分
            if (
              data.engineResult.result.pronunciation &&
              data.engineResult.result.pronunciation.score
            ) {
              data.engineResult.result.pronunciation.score = IfLevel(
                Number(data.engineResult.result.pronunciation.score) + offset
              ); // 发音
            }
            if (data.engineResult.result.integrity && data.engineResult.result.integrity.score) {
              data.engineResult.result.integrity.score = IfLevel(
                Number(data.engineResult.result.integrity.score) + offset
              ); // 完整度
            }
            if (data.engineResult.result.fluency && data.engineResult.result.fluency.score) {
              data.engineResult.result.fluency.score = IfLevel(
                Number(data.engineResult.result.fluency.score) + offset
              ); // 流利度
            }
            if (data.engineResult.result.rhythm && data.engineResult.result.rhythm.score) {
              data.engineResult.result.rhythm.score = IfLevel(
                Number(data.engineResult.result.rhythm.score) + offset
              );
            }
            if (data.engineResult.result.rhythm && data.engineResult.result.rhythm.sense) {
              data.engineResult.result.rhythm.sense = IfLevel(
                Number(data.engineResult.result.rhythm.sense) + offset
              );
            }
            if (data.engineResult.result.rhythm && data.engineResult.result.rhythm.stress) {
              data.engineResult.result.rhythm.stress = IfLevel(
                Number(data.engineResult.result.rhythm.stress) + offset
              );
            }
            if (data.engineResult.result.rhythm && data.engineResult.result.rhythm.tone) {
              data.engineResult.result.rhythm.tone = IfLevel(
                Number(data.engineResult.result.rhythm.tone) + offset
              );
            }
          }
          // 2019-11-20 17:20:44
          // Item.answerValue=data.engineResult;
          // // 其他答题属性
          // Item.fileId=data.fileId;// 有值代表录音了，没值代表没录音
          // Item.manualDetail=data.manualDetail;// 人工纠偏的点评
        }
        // update 2019-11-20 17:19:49
        // VB-8892 学生 报告部分题目的答案解析显示未作答，无机评结果时显示 不清晰balabala...
        Item.answerValue = data.engineResult;
        // 其他答题属性
        Item.fileId = data.tokenId; // 有值代表录音了，没值代表没录音
        Item.manualDetail = data.manualDetail; // 人工纠偏的点评
      }
      return true;
    }
    return false;
  };

  // 用小题ID查找,学生答案
  findAnswer = qid => {
    const { studentAnswer } = this.props;
    let a = studentAnswer.find(item => item.subquestionNo === qid);
    return a;
  };

  renderPaperFooter(questionIndexData) {
    const { isCanSee } = this.props;
    if (this.props.studentId) {
      return (
        <div className={styles.marginTop20}>
          <div className={styles.questionbtn}>
            <IconButton iconName="icon-help" text="答案解析" />
          </div>
          <Analysis
            dataSource={questionIndexData}
            masterData={this.props.masterData}
            isCanSee={isCanSee}
            examReport
            evaluations
          />
        </div>
      );
    }
    const {
      isPapergroupFooter,
      questionIds,
      dataSource,
      ishaveFooter,
      titleData,
      questionIndex,
      mainIndex,
      questionCount,
    } = this.props;
    const { ischoosed } = this.state;

    const type = titleData.questionPatternType;
    let subAnswerIndex = '';
    /* 给答案和解析的题号 */
    if (type === 'NORMAL') {
      subAnswerIndex = questionCount;
    } else if (type === 'COMPLEX') {
      subAnswerIndex = titleData.groups[questionIndex].pattern.sequenceNumber[0][0];
    } else {
      subAnswerIndex = titleData.sequenceNumber[questionIndex][0];
    }

    const jsx = <AnswersModal dataSource={questionIndexData} masterData={subAnswerIndex} />;
    return <div className={isCanSee ? '' : styles.filter}>{jsx}</div>;
  }

  render() {
    const {
      dataSource,
      showData,
      questionIndex,
      type,
      questionCount,
      mainIndex,
      subIndex,
      beforeNum,
      invalidate,
      masterData,
      isExamine,
      ExampaperStatus,
    } = this.props;

    /* 题目实体数据 */
    let mainData = {};

    /* 小题目展示数据 */
    let componentsData = [];
    /* 子题目展示数据 */
    let subComponentsData = [];

    let componentsConfig = [];
    /* veiwinfo排序数组 */
    const newData = [];
    /* 小题展示 */
    let jsx = [];
    /* 子题展示 */
    let subJsx = [];

    /* 横竖排展示 */
    const subStyle = '';

    mainData = dataSource.data; // 题目实体数据

    let transformStyle = {};
    if (this.state.showDetail) {
      transformStyle = {
        transform: 'translateY(0px)',
        transition: 'transform 0.2s ease 0.2s',
      };
    } else {
      transformStyle = {
        transform: 'translateY(900px)',
        transition: 'transform 0.2s ease 0.2s',
      };
    }
    /* 小题Data */
    let questionIndexData = {};
    const invalidateArr = [];
    if (invalidate && invalidate.mains) {
      invalidate.mains.map(item => {
        if (item && item.verifies) {
          item.verifies.map(vo => {
            if (vo.questionId == dataSource.id) {
              invalidateArr.push(vo);
            }
          });
        }
      });
    }
    // console.log('===========')
    // console.log(invalidateArr)
    // console.log('==========')
    if (type == 'COMPLEX') {
      componentsData = showData.structure.groups[questionIndex].structure.viewInfo.components; // 小题的配置
      subComponentsData = showData.structure.groups[questionIndex].structure.viewInfo.subComponents; // 子题的配置
      componentsConfig = showData.structure.groups;
    } else {
      componentsData = showData.structure.viewInfo.components; // 小题的配置
      subComponentsData = showData.structure.viewInfo.subComponents; // 子题的配置
    }

    /* sort排序components */
    for (const i in componentsData) {
      const index = Number(componentsData[i].orderIndex);
      newData[index] = {};
      newData[index].components = componentsData[i];
    }
    /* sort排序subComponents */
    for (const i in subComponentsData) {
      const index = Number(subComponentsData[i].orderIndex);
      if (newData[index] == undefined) {
        newData[index] = {};
        newData[index].subComponents = subComponentsData[i];
      } else {
        newData[index].subComponents = subComponentsData[i];
      }
    }

    if (type == 'NORMAL') {
      // 普通题型展示
      questionIndexData = mainData;
      this.getStudentReport(questionIndexData);
      jsx = this.mainQuestionItem(newData, mainData, jsx, componentsConfig);
    } else if (type == 'TWO_LEVEL') {
      // 二层题型展示
      questionIndexData = mainData;
      this.getStudentReport(questionIndexData);
      jsx = this.mainQuestionItem(newData, mainData, jsx, componentsConfig);

      subJsx = this.subQuestionItem(showData, newData, mainData, subJsx);
    } else if (type == 'COMPLEX') {
      // 复合题型展示
      const groupsItem = mainData.groups[questionIndex].data;
      questionIndexData = groupsItem;
      this.getStudentReport(questionIndexData);
      if (groupsItem.patternType == 'NORMAL') {
        jsx = this.mainQuestionItem(newData, groupsItem, jsx, componentsConfig);
      } else if (groupsItem.patternType == 'TWO_LEVEL') {
        jsx = this.mainQuestionItem(newData, groupsItem, jsx, componentsConfig);
        subJsx = this.subQuestionItem(
          showData.structure.groups[questionIndex],
          newData,
          groupsItem,
          subJsx
        );
      }
    }

    // let modelStatus = ExampaperStatus;
    // let isExamine = localStorage.getItem('isExamine');
    return (
      <div key="logo">
        {jsx}
        {subJsx}
        {this.renderPaperFooter(questionIndexData)}
      </div>
    );
  }
}

export default QuestionShowCard;
