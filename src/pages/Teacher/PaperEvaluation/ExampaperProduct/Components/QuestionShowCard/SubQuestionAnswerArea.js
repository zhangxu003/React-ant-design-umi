/* eslint-disable react/no-unused-state */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable eqeqeq */
import React, { PureComponent } from 'react';
import { Input } from 'antd';
import styles from './index.less';

/*
    填空答题区域

 */

export default class SubQuestionAnswerArea extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      audioUrl: '',
      isPlay: false,
    };
  }

  componentDidMount() {}

  render() {
    const {
      index,
      value,
      isRight,
      callback,
      disabled,
      subStyle,
      callbackBlur,
      gapMode,
      allowMultiAnswerMode,
    } = this.props;
    let borderColor = '';
    let backColor = '';
    if (isRight == undefined) {
      borderColor = '1px solid rgba(204, 204, 204, 1)';
    } else if (isRight) {
      borderColor = '1px solid #03C46B';
      backColor = '#DEFBE7';
    } else {
      borderColor = '1px solid #FF6E4A';
      backColor = '#FFF2EF';
    }

    return (
      <div
        className={styles.answerArea}
        style={
          subStyle == 'flex'
            ? { border: borderColor, background: backColor }
            : { borderBottom: borderColor, background: backColor }
        }
      >
        {allowMultiAnswerMode == 'Y' && gapMode && (
          <div className={styles.question_num} style={{ borderRight: borderColor }}>
            {index}
          </div>
        )}
        {disabled ? (
          <div className={styles.ant_div}>{value}</div>
        ) : (
          <Input
            className={styles.ant_input}
            style={{ background: backColor }}
            defaultValue={value}
            disabled={disabled}
            maxLength={200}
            onChange={e => {
              // console.log(e.target.value);
              if (this.props.changeleftMeus) {
                this.props.changeleftMeus();
              }
              callback(e.target.value);
            }}
            onBlur={e => {
              console.log(e.target.value);
              callbackBlur(e.target.value);
            }}
          />
        )}
      </div>
    );
  }
}
