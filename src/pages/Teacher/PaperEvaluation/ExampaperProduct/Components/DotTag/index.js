/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-array-index-key */
/* eslint-disable eqeqeq */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
import React, { PureComponent } from 'react';
import styles from './index.less';
import side_cut_page_pic from '@/frontlib/assets/ExampaperAttempt/side_cut_page_pic.png';
import side_cut_page_pic_active from '@/frontlib/assets/ExampaperAttempt/side_cut_page_pic_active.png';
import side_back_tag_pic_active from '@/frontlib/assets/ExampaperAttempt/side_back_tag_pic_active.png';
import side_back_tag_pic from '@/frontlib/assets/ExampaperAttempt/side_back_tag_pic.png';

/*
    制作试卷左侧图标

 */

export default class DotTag extends PureComponent {
  checktype = item => {
    const { status, data, focusIndex, mainIndex, questionType, isPlugin } = this.props;

    let isChoose = false;

    const dataType = data.type;
    if (dataType == 'NORMAL' || dataType == 'INTRODUCTION') {
      if (
        focusIndex.mainIndex == mainIndex &&
        focusIndex.questionIndex == data.index &&
        focusIndex.subIndex == undefined
      ) {
        isChoose = true;
      }
    } else if (dataType == 'TWO_LEVEL') {
      if (
        focusIndex.mainIndex == mainIndex &&
        (focusIndex.subIndex == item || isPlugin) &&
        focusIndex.questionIndex == data.index
      ) {
        isChoose = true;
      }
      if (data.allowMultiAnswerMode == 'Y') {
        if (focusIndex.mainIndex == mainIndex && focusIndex.questionIndex == data.index) {
          isChoose = true;
        }
      }
    } else if (dataType == 'COMPLEX') {
      console.log(dataType, 'dot');
    } else if (dataType == 'SPLITTER' || questionType == 'RECALL') {
      if (focusIndex.mainIndex == mainIndex && focusIndex.questionIndex == data.index) {
        isChoose = true;
      }
    }

    if (isChoose) {
      return 'orange-dot';
    }
    switch (status) {
      case 0:
        return 'normal-dot';
      case 100:
        return 'normal-dot';
      case 200: // ●有回复
        return 'blue-dot';
      case 300: // ●有误
        return 'red-dot';
      default:
        return '';
    }
  };

  background = status => {
    switch (status) {
      case 0:
        return 'DotTag-orange ';
      case 100:
        return 'DotTag-orange ';
      case 200: // ●有回复
        return 'DotTag-blue ';
      case 300: // ●有误
        return 'DotTag-red ';
      default:
        return '';
    }
  };

  render() {
    const {
      className,
      status,
      style,
      arr,
      data,
      mainIndex,
      questionType,
      questionIds,
    } = this.props;
    const width = arr.length * 24;
    let wrap = null;
    if (width > 220) {
      wrap = { flexWrap: 'wrap' };
    }

    if (questionType == 'SPLITTER') {
      return (
        <div className={styles.flex}>
          {this.checktype('i') != 'orange-dot' ? (
            <img src={side_cut_page_pic} alt="" />
          ) : (
            <img src={side_cut_page_pic_active} alt="" />
          )}
        </div>
      );
    }
    if (questionType == 'RECALL') {
      return (
        <div className={styles.flex}>
          {this.checktype('i') != 'orange-dot' ? (
            <img src={side_back_tag_pic} alt="" />
          ) : (
            <img src={side_back_tag_pic_active} alt="" />
          )}
        </div>
      );
    }
    return (
      <div
        className={this.background(status) + className}
        // onClick={onClick}
        style={style}
        style={{ width: `${width}px`, ...wrap }}
      >
        {arr.map((item, index) => (
          <div
            className={`dot ${this.checktype(item)}`}
            key={`dot_${index}`}
            onClick={() => {
              // console.log(questionIds, index);
              this.props.index.onClick(
                Number(item),
                mainIndex,
                data.index,
                data.type,
                questionIds[index]
              );
            }}
          >
            {`${item}`.trim() == '' ? <div className={styles.dot} /> : <span>{item}</span>}
          </div>
        ))}
      </div>
    );
  }
}
