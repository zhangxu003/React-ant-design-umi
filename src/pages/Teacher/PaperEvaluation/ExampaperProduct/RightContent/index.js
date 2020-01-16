/* eslint-disable react/destructuring-assignment */
/* eslint-disable guard-for-in */
/* eslint-disable no-case-declarations */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable prefer-destructuring */
/* eslint-disable react/no-unused-state */
import React, { PureComponent } from 'react';
import { Menu, Icon, Dropdown } from 'antd';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
import styles from './index.less';
import ItemCard from '../Components/ItemCard';
import {
  toChinesNum,
  autoCreatePatternInfoText,
  returnSubIndex,
  filterPrompt,
  returnSubs,
} from '@/frontlib/utils/utils';
import Spliter from '@/frontlib/components/ExampaperProduct/Components/Spliter';
import RecallPage from '@/frontlib/components/ExampaperProduct/Components/RecallPage';
import PromptSound from '@/frontlib/components/PromptSound';

const messages = defineMessages({
  introLabel: {
    id: 'app.open.book.intro.label',
    defaultMessage: '开卷介绍',
  },
  questionProofread: { id: 'app.question.to.be.proofread', defaultMessage: '待校对' },
  validateFail: { id: 'app.fail.question.proofread', defaultMessage: '不通过' },
  validatePass: { id: 'app.pass.question.proofread', defaultMessage: '通过' },
  validateIgnored: { id: 'app.question.modify.ignored', defaultMessage: '已忽略' },
  validateModified: { id: 'app.question.modified', defaultMessage: '已修正' },
  proofreadBtn: { id: 'app.question.proofread.btn', defaultMessage: '校对' },
  passProofread: { id: 'app.question.pass.proofread', defaultMessage: '校对通过' },
  proofreadFailure: { id: 'app.question.proofread.failure', defaultMessage: '校对不通过' },
  bookAddBtn: { id: 'app.open.book.add.btn', defaultMessage: '添加开卷' },
});

/**
 * paperData 试卷详情
 * masterData 主控数据
 * mainType 是否独立展示答题指导
 * guideIndex 答题指导index
 */
export default class RightContent extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      questionPatternInstanceName: '',
      answerGuideText: '',
      contentData: {},
      paperHeadAudio: '',
      isRecord: -1, // 展示录音组件
      mainType: false,
      focusId: '',
      text: '',
      subText: '',
      subfocusIndex: 0, // 模仿跟读子题型subIndex
    };
  }

  componentDidMount() {
    const { paperData, masterData } = this.props;
    this.assemblyData(paperData, masterData);
  }

  componentWillReceiveProps(nextProps) {
    const { paperData, masterData } = nextProps;
    if (nextProps.mainType) {
      const mainIndex = nextProps.guideIndex;
      const paperInstance = paperData.paperInstance;
      const mainPatterns = paperInstance[mainIndex - 1].pattern.mainPatterns;
      this.setState({
        questionPatternInstanceName: this.switchLabel(
          mainIndex,
          mainPatterns.questionPatternInstanceName ||
            paperInstance[mainIndex - 1].pattern.questionPatternName,
          mainPatterns.fullMark,
          paperData,
          masterData
        ),
        answerGuideText:
          mainPatterns.answerGuideText == 'NO_GUIDE' ? null : mainPatterns.answerGuideText,
        mainType: true,
      });
    } else {
      this.state.mainType = false;
      this.assemblyData(paperData, masterData);
    }
  }

  assemblyData = (paperData, masterData) => {
    const mainIndex = masterData.staticIndex.mainIndex;

    const paperInstance = paperData.paperInstance;

    /** =======================================================================================================================
     * 录音组件是否展示
     * paperData  试卷详情
     * masterData 主控数据
     */
    const staticIndex = masterData.staticIndex;
    let isRecord = -1;
    // console.log('===录音组件是否展示===')
    if (
      staticIndex.mainIndex != 0 &&
      paperInstance[staticIndex.mainIndex - 1].type != 'SPLITTER' &&
      paperInstance[staticIndex.mainIndex - 1].type != 'RECALL'
    ) {
      let itemData = paperInstance[staticIndex.mainIndex - 1].questions[staticIndex.questionIndex];
      const type = paperInstance[staticIndex.mainIndex - 1].pattern.questionPatternType;

      if (type == 'COMPLEX') {
        const complexData = paperInstance[staticIndex.mainIndex - 1].questions[0];
        if (complexData == null) {
          itemData = null;
        } else {
          itemData = complexData.data.groups[staticIndex.questionIndex];
        }
      }

      if (itemData == null || itemData == undefined) {
        // 还未录题
        isRecord = -1;
      } else {
        const answerType = itemData.data.mainQuestion.answerType;
        if (
          answerType != 'GAP_FILLING' &&
          answerType != 'CHOICE' &&
          answerType != null &&
          answerType != ''
        ) {
          // 口语题展示录音
          isRecord = 0;
        } else {
          isRecord = -1;
        }
      }
    } else {
      isRecord = -1;
    }

    /* ======================================================================================================================= */
    if (mainIndex == 0) {
      this.setState({
        questionPatternInstanceName: formatMessage(messages.introLabel),
        contentData: {},
        answerGuideText: '',
        isRecord,
      });
    } else if (
      mainIndex != 0 &&
      paperInstance[staticIndex.mainIndex - 1].type != 'SPLITTER' &&
      paperInstance[staticIndex.mainIndex - 1].type != 'RECALL'
    ) {
      const mainPatterns = paperInstance[mainIndex - 1].pattern.mainPatterns;
      this.setState({
        questionPatternInstanceName: this.switchLabel(
          mainIndex,
          mainPatterns.questionPatternInstanceName ||
            paperInstance[mainIndex - 1].pattern.questionPatternName,
          mainPatterns.fullMark,
          paperData,
          masterData
        ),
        answerGuideText:
          mainPatterns.answerGuideText == 'NO_GUIDE' ? null : mainPatterns.answerGuideText,
        contentData: paperInstance[mainIndex - 1].pattern,
        isRecord,
      });
    } else if (paperInstance[staticIndex.mainIndex - 1].type == 'SPLITTER') {
      this.setState({
        questionPatternInstanceName: formatMessage({
          id: 'app.text.separatorpage',
          defaultMessage: '分隔页',
        }),
        contentData: {},
        answerGuideText: '',
        isRecord,
      });
    } else if (paperInstance[staticIndex.mainIndex - 1].type == 'RECALL') {
      this.setState({
        questionPatternInstanceName: formatMessage({
          id: 'app.text.hsy',
          defaultMessage: '回溯页',
        }),
        contentData: {},
        answerGuideText: '',
        isRecord,
      });
    }
  };

  switchLabel = (index, label, fullMark, paperData, masterData) => {
    const paperInstance = paperData.paperInstance;
    const mainIndex = index;

    let mainGuideSinglePage = false;
    if (paperData.config && paperData.config.mainGuideSinglePage == 'Y') {
      mainGuideSinglePage = true;
    }
    let text = '';
    if (mainIndex > 0) {
      if (
        paperInstance[mainIndex - 1].pattern.mainPatterns &&
        paperInstance[mainIndex - 1].pattern.mainPatterns.questionPatternInstanceName
      ) {
        text =
          (paperInstance[mainIndex - 1].pattern.mainPatterns.questionPatternInstanceSequence ||
            '') +
          paperInstance[mainIndex - 1].pattern.mainPatterns.questionPatternInstanceName +
          (paperInstance[mainIndex - 1].pattern.mainPatterns.questionPatternInstanceHint || '');
      } else {
        let num = 0;
        const paperInstance = paperData.paperInstance;
        for (let i = 1; i < index; i++) {
          if (
            paperInstance[Number(i) - 1].type != 'PATTERN' &&
            paperInstance[Number(i) - 1].type != null
          ) {
            num += 1;
          }
        }
        const questionPatternInstanceName = `${toChinesNum(index - num)}、${label}`;
        text = `${questionPatternInstanceName} ${autoCreatePatternInfoText(
          paperInstance[mainIndex - 1],
          false
        )}`;
      }
    }

    return text;
  };

  /**
   * @Author   tina.zhang
   * @DateTime  2018-10-17
   * @copyright 渲染添加题型卡片
   * @return    {[type]}    [description]
   */
  renderItemCard() {
    const {
      paperData,
      masterData,
      editData,
      showData,
      invalidate,
      isExamine,
      ExampaperStatus,
    } = this.props;
    const { contentData } = this.state;
    const jsx = [];
    let viewInfo = {};
    const mainIndex = masterData.staticIndex.mainIndex;
    const paperInstance = paperData.paperInstance;
    if (contentData.questionPatternType == 'NORMAL') {
      const questionIndex = masterData.staticIndex.questionIndex;
      viewInfo =
        showData[paperInstance[mainIndex - 1].pattern.questionPatternId].structure.viewInfo;
      let startIndex = 0;
      let endIndex = Number(contentData.mainPatterns.questionCount);
      if (paperInstance[mainIndex - 1].pattern.pageSplit) {
        let pageSplit = paperInstance[mainIndex - 1].pattern.pageSplit;
        pageSplit = pageSplit.sort();
        for (const a in pageSplit) {
          if (Number(pageSplit[a]) >= Number(questionIndex)) {
            if (a != 0) {
              startIndex = pageSplit[Number(a) - 1] + 1;
            }
            endIndex = pageSplit[a] + 1;
            break;
          }
        }
        for (let b = pageSplit.length; b >= 0; b--) {
          if (Number(pageSplit[b]) < Number(questionIndex)) {
            startIndex = pageSplit[b] + 1;
            if (b != pageSplit.length - 1) {
              endIndex = pageSplit[Number(b) + 1] + 1;
            }
            break;
          }
        }
      }
      if (viewInfo.multipleQuestionPerPage == 'Y') {
        // 一页多题
        for (let i = startIndex; i < endIndex; i++) {
          jsx.push(
            <ItemCard
              index={i + 1}
              self={this}
              focus={masterData.staticIndex.questionIndex == i}
              mainIndex={mainIndex}
              showData={showData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
              editData={
                editData && editData[paperInstance[mainIndex - 1].pattern.questionPatternId]
              }
              dataSource={paperInstance[mainIndex - 1].questions}
              pattern={paperInstance[mainIndex - 1].pattern}
              masterData={masterData}
              invalidate={invalidate}
              paperId={paperData.id}
              paperData={paperData}
              isExamine={isExamine}
              questionIndex={i + 1}
              type={contentData.questionPatternType}
              key={`ItemCard1_${paperInstance[mainIndex - 1].pattern.questionPatternId}${i}`}
              ExampaperStatus={ExampaperStatus}
            />
          );
        }
      } else {
        // 一页单题
        jsx.push(
          <ItemCard
            index={questionIndex + 1}
            self={this}
            focus
            mainIndex={mainIndex}
            showData={showData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
            editData={editData && editData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
            dataSource={paperInstance[mainIndex - 1].questions}
            pattern={paperInstance[mainIndex - 1].pattern}
            invalidate={invalidate}
            masterData={masterData}
            paperId={paperData.id}
            paperData={paperData}
            isExamine={isExamine}
            questionIndex={questionIndex + 1}
            type={contentData.questionPatternType}
            key={`ItemCard1_${paperInstance[mainIndex - 1].pattern.questionPatternId}`}
            ExampaperStatus={ExampaperStatus}
          />
        );
      }
    } else if (contentData.questionPatternType == 'TWO_LEVEL') {
      const questionIndex = masterData.staticIndex.questionIndex;

      let beforeNum = 0;
      if (questionIndex != 0) {
        let subQuestionCount = 0;
        for (let o = 0; o < questionIndex; o++) {
          subQuestionCount += contentData.subQuestionPatterns[o].subQuestionCount;
        }
        beforeNum = subQuestionCount;
      }

      jsx.push(
        <div key={`ItemCard1s_div${mainIndex}`} className={styles.title}>
          {contentData.subQuestionPatterns[questionIndex] &&
            contentData.subQuestionPatterns[questionIndex].hintText}
        </div>
      );
      jsx.push(
        <ItemCard
          index={questionIndex + 1}
          focus
          subIndex={masterData.staticIndex.subIndex}
          mainIndex={mainIndex}
          questionIndex={questionIndex}
          beforeNum={questionIndex + 1}
          beforeNums={beforeNum}
          invalidate={invalidate}
          subs={returnSubs(masterData)}
          self={this}
          key={`ItemCard1s${paperInstance[mainIndex - 1].pattern.questionPatternId}`}
          paperId={paperData.id}
          paperData={paperData}
          isExamine={isExamine}
          showData={showData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
          editData={editData && editData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
          dataSource={paperInstance[mainIndex - 1].questions}
          pattern={paperInstance[mainIndex - 1].pattern}
          masterData={masterData}
          type={contentData.questionPatternType}
          ExampaperStatus={ExampaperStatus}
          onChange={this.changeSubIndex}
        />
      );
    } else if (contentData.questionPatternType == 'COMPLEX') {
      const questionIndex = masterData.staticIndex.questionIndex;
      const groupsItem = contentData.groups[questionIndex];

      let questionNum = 0;

      for (let m = 0; m < questionIndex; m++) {
        if (contentData.groups[questionIndex - 1].pattern.questionPatternType == 'TWO_LEVEL') {
          questionNum +=
            contentData.groups[questionIndex - 1].pattern.mainPatterns.subQuestionCount;
        } else {
          questionNum += contentData.groups[m].pattern.mainPatterns.questionCount;
        }
      }

      jsx.push(
        <div key={`ItemCard1x_div${mainIndex}`} className={styles.title}>
          {contentData.groups[questionIndex].pattern.mainPatterns.answerGuideText == 'NO_GUIDE'
            ? null
            : contentData.groups[questionIndex].pattern.mainPatterns.answerGuideText}
        </div>
      );

      if (
        contentData.groups[questionIndex].pattern.subQuestionPatterns &&
        contentData.groups[questionIndex].pattern.subQuestionPatterns[0]
      ) {
        jsx.push(
          <div key={`ItemCard1x_divmainIndex${mainIndex}`} className={styles.title}>
            {contentData.groups[questionIndex].pattern.subQuestionPatterns[0].hintText}
          </div>
        );
      }

      jsx.push(
        <ItemCard
          index={questionIndex + 1}
          focus
          mainIndex={mainIndex}
          subIndex={masterData.staticIndex.subIndex}
          questionIndex={questionIndex}
          beforeNum={questionIndex + 1}
          beforeNums={questionNum}
          invalidate={invalidate}
          subs={returnSubs(masterData)}
          self={this}
          showData={showData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
          editData={editData && editData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
          dataSource={paperInstance[mainIndex - 1].questions}
          pattern={paperInstance[mainIndex - 1].pattern}
          paperId={paperData.id}
          paperData={paperData}
          isExamine={isExamine}
          masterData={masterData}
          key={`ItemCard1x${paperInstance[mainIndex - 1].pattern.questionPatternId}`}
          type={contentData.questionPatternType}
          ExampaperStatus={ExampaperStatus}
        />
      );
    }

    return jsx;
  }

  renderDescription(questionPatternInstanceName) {
    const { answerGuideText, contentData, isRecord, text } = this.state;
    const { paperData, masterData, mainType, ExampaperStatus } = this.props;
    const paperInstance = paperData.paperInstance;
    const mainIndex = masterData.staticIndex.mainIndex;
    const staticIndex = masterData.staticIndex;
    let mainGuideSinglePage = false;
    if (paperData.config && paperData.config.mainGuideSinglePage == 'Y') {
      mainGuideSinglePage = true;
    }

    switch (questionPatternInstanceName) {
      case formatMessage(messages.introLabel):
        return null;
      case formatMessage({ id: 'app.text.separatorpage', defaultMessage: '分隔页' }):
        return <Spliter paperData={paperData} masterData={masterData} />;
      case formatMessage({ id: 'app.text.hsy', defaultMessage: '回溯页' }):
        return <RecallPage />;
      default:
        const text = '';
        let hintText = [];
        let subText = '';
        let showQuestionPatternInstanceName = true;
        if (mainIndex > 0) {
          if (paperInstance[mainIndex - 1].pattern.questionPatternType == 'COMPLEX') {
            const groupItem =
              paperInstance[mainIndex - 1].pattern.groups[masterData.staticIndex.questionIndex];

            subText =
              (groupItem.pattern.mainPatterns.questionPatternInstanceSequence || '') +
              groupItem.pattern.mainPatterns.questionPatternInstanceName +
              (groupItem.pattern.mainPatterns.questionPatternInstanceHint || '');
            if (
              paperInstance[mainIndex - 1].pattern.mainPatterns.showQuestionPatternInstanceName &&
              paperInstance[mainIndex - 1].pattern.mainPatterns.showQuestionPatternInstanceName ==
                'N'
            ) {
              showQuestionPatternInstanceName = false;
            }
          }
          const hintData = masterData.mains[mainIndex].questions[staticIndex.questionIndex].hints;

          if (hintData) {
            hintText = filterPrompt(
              hintData,
              masterData.mains[mainIndex].questions[staticIndex.questionIndex].allowMultiAnswerMode,
              returnSubIndex(masterData)
            );
          }
        }
        const hintJsx = [];

        for (const i in hintText) {
          hintJsx.push(
            <Menu.Item key={i}>
              <PromptSound
                hint={hintText[i]}
                key={`hint_${i}`}
                idx={this.state.focusId}
                callback={e => {
                  this.setState({ focusId: e });
                }}
              />
            </Menu.Item>
          );
          if (i != hintText.length - 1) {
            hintJsx.push(<Menu.Divider />);
          }
        }
        const menu = <Menu>{hintJsx}</Menu>;
        if (mainGuideSinglePage) {
          if (showQuestionPatternInstanceName) {
            // 显示复合题型标题
            return (
              <div
                className="problem"
                key={`problem_${mainIndex}${staticIndex.questionIndex}${staticIndex.subIndex}`}
              >
                <div className="title">{questionPatternInstanceName}</div>
                {mainType && answerGuideText != 'NO_GUIDE' ? (
                  <div className="description">{answerGuideText}</div>
                ) : null}
                {subText != '' && !mainType && <div className="description">{subText}</div>}
                {/* {hintText.length != 0 &&
                  !mainType &&
                  ExampaperStatus !== 'EXAM' &&
                  ExampaperStatus !== 'AFTERCLASS' && (
                    <Dropdown overlay={menu}>
                      <div className={styles.tipButton}>
                        {"提示语（"+hintText.length+"）"}
                        <FormattedMessage
                          id="app.paper.process.node.tip"
                          defaultMessage="提示语({param})"
                          values={{ param: hintText.length }}
                        />
                        <Icon type="down" />
                      </div>
                    </Dropdown>
                  )} */}
              </div>
            );
          }
          return (
            <div
              className="problem"
              key={`problem_${mainIndex}${staticIndex.questionIndex}${staticIndex.subIndex}`}
            >
              {mainType && <div className="title">{questionPatternInstanceName}</div>}
              {mainType && answerGuideText != 'NO_GUIDE' ? (
                <div className="description">{answerGuideText}</div>
              ) : null}
              {subText != '' && !mainType && <div className="title">{subText}</div>}
              {/* {hintText.length != 0 &&
                !mainType &&
                ExampaperStatus !== 'EXAM' &&
                ExampaperStatus !== 'AFTERCLASS' && (
                  <Dropdown overlay={menu}>
                    <div className={styles.tipButton}>
                      {"提示语（"+hintText.length+"）"}
                      <FormattedMessage
                        id="app.paper.process.node.tip"
                        defaultMessage="提示语({param})"
                        values={{ param: hintText.length }}
                      />
                      <Icon type="down" />
                    </div>
                  </Dropdown>
                )} */}
            </div>
          );
        }
        return (
          <div
            className="problem"
            key={`problem_${mainIndex}${staticIndex.questionIndex}${staticIndex.subIndex}`}
          >
            <div className="title">{questionPatternInstanceName}</div>
            {answerGuideText == 'NO_GUIDE' ? null : (
              <div className="description">{answerGuideText}</div>
            )}
            {subText != '' && <div className="description">{subText}</div>}
            {/* {hintText.length != 0 &&
              ExampaperStatus !== 'EXAM' &&
              ExampaperStatus !== 'AFTERCLASS' && (
                <Dropdown overlay={menu}>
                  <div className={styles.tipButton}>
                    {"提示语（"+hintText.length+"）"}
                    <FormattedMessage
                      id="app.paper.process.node.tip"
                      defaultMessage="提示语({param})"
                      values={{ param: hintText.length }}
                    />
                    <Icon type="down" />
                  </div>
                </Dropdown>
              )} */}
          </div>
        );
    }
  }

  render() {
    const { questionPatternInstanceName } = this.state;
    return (
      <div className="paper_rightContent" id="paper_rightContent">
        {this.renderDescription(questionPatternInstanceName)}

        <div className="addquestion_Item" id="addquestion_Item">
          {this.renderItemCard()}
        </div>
      </div>
    );
  }
}
