/*
 * @Author: tina.zhang
 * @LastEditors: jeffery.shi
 * @Description: 一键检测环境测试弹框
 * @Date: 2019-02-20 14:22:33
 * @LastEditTime: 2019-05-08 14:49:01
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import cs from 'classnames';
import { message } from 'antd';
import { formatMessage } from 'umi/locale';
import { getcode } from '@/utils/instructions';
import styles from './index.less';

@connect(({ popup }) => {
  const { data } = popup.autoCheck;
  return { data };
})
class AutoCheck extends Component {
  state = {
    inputCode: '',
  };

  constructor(props) {
    super(props);
    const { modal } = props;
    modal.update({
      className: cs(styles.confirm, styles.close),
      title: (
        <div className={styles.title}>
          {formatMessage({ id: 'task.title.input.control.code', defaultMessage: '鉴权密钥' })}
        </div>
      ),
    });
  }

  // 选择数字
  clickNumber = val => {
    const { doSure, modal } = this.props;
    const { inputCode } = this.state;
    if (inputCode.length === 4) return;
    // 如果有提示code不正确的提示框，则关闭
    if (this.errorCodeMsg && typeof this.errorCodeMsg === 'function') {
      this.errorCodeMsg();
    }
    this.setState(
      {
        inputCode: `${inputCode}${val}`,
      },
      () => {
        const { inputCode: newCode } = this.state;
        if (newCode.length === 4) {
          // 如果当前已经输入了4位，则进行确认
          if (newCode === getcode().code.toString()) {
            doSure();
            modal.close();
          } else {
            this.errorCodeMsg = message.error(
              formatMessage({
                id: 'task.message.input.control.code.is.error',
                defaultMessage: '鉴权码错误',
              })
            );
          }
        }
      }
    );
  };

  // 回退按钮
  backCodeVal = () => {
    const { inputCode } = this.state;
    if (inputCode.length === 0) return;
    this.setState({
      inputCode: inputCode.substring(0, inputCode.length - 1),
    });
  };

  render() {
    const { inputCode } = this.state;
    const len = inputCode.length;

    return (
      <div>
        <div className={styles.SecretKeyModal}>
          {Array.from({ length: 4 }, (_, key) => (
            <div className={styles.item} key={key}>
              {len > key && <div className={styles.around} />}
            </div>
          ))}
        </div>
        <div className={styles.keyword}>
          <div className={styles['keyword-num']}>
            {Array.from({ length: 10 }, (_, key) => (
              <div
                className={styles['num-button']}
                key={key}
                onClick={() => this.clickNumber((key + 1) % 10)}
              >
                {(key + 1) % 10}
              </div>
            ))}
          </div>
          <div className={styles['keyword-del']} onClick={this.backCodeVal}>
            回退
          </div>
        </div>
      </div>
    );
  }
}

export default AutoCheck;
