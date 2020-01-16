/*
 * @Author: tina.zhang
 * @Date: 2019-01-02 16:18:55
 * @LastEditors: jeffery.shi
 * @LastEditTime: 2019-05-08 14:36:13
 * @Description: vb 客户端右上角的 最大最小化关闭客户端等功能的基本样式
 */
import React from 'react';
import { connect } from 'dva';
import Modal from '@/components/Modal';
import cs from 'classnames';
import SecretKey from '@/pages/popup/SecretKey';
import { vbClientWin, getcode } from '@/utils/instructions';
import styles from './CommandContainer.less';

@connect(({ vbClient }) => ({
  role: vbClient.role, // student ： 学生机； teacher : 教师机
  runtimeMode: vbClient.runtimeMode, // vbClient允许模式，development 开发时,   production 产品时,   presentation 演示时
}))
class CommandContainer extends React.PureComponent {
  // 最大化-普通
  maximize = () => {
    vbClientWin.size = 'maximize';
  };

  // 最小化
  minimize = () => {
    vbClientWin.size = 'minimize';
  };

  // 关闭
  close = () => {
    vbClientWin.close();
  };

  // 关闭x
  handleClose = () => {
    const { role, runtimeMode } = this.props;
    const { code } = getcode();
    if (code === -1 || role !== 'student' || runtimeMode === 'development') {
      this.close();
    } else {
      // 弹出框，判断输入密钥
      Modal.confirm({
        title: '',
        width: 380,
        closable: false,
        centered: true,
        icon: null,
        content: <SecretKey doSure={this.close} />,
        okButtonProps: {
          style: { display: 'none' },
        },
        cancelButtonProps: {
          style: { display: 'none' },
        },
      });
    }
  };

  render() {
    const { role, runtimeMode } = this.props;

    // 当为生产模式时，客户端（学生机）去掉最大化、最小化，保留X，点击X，弹框要求输入鉴权码，点击“确定”，进行匹配，成功，关闭窗体，否提示“鉴权码错误”。
    // 注：调用vb.getConfigurationManager().code  如果 返回{"code":-1} 则不用输入鉴权密钥，可直接关闭
    // 演示模式、开发模式，放开最大化、最小化、X功能；

    const commands = [
      {
        key: 'minimize',
        className: styles.minimize,
        fn: this.minimize,
        disabled: runtimeMode === 'production' && role === 'student',
      },
      {
        key: 'maximize',
        className: styles.maximize,
        fn: this.maximize,
        disabled: runtimeMode === 'production' && role === 'student',
      },
      {
        key: 'close',
        className: styles.close,
        fn: this.handleClose,
        disabled: false,
      },
    ];

    return (
      <div className={cs(styles.command)}>
        <ul className={cs(styles['sys-commands'])}>
          {commands
            .filter(item => !item.disabled)
            .map(item => (
              <li key={item.key} className={item.className} onClick={item.fn} />
            ))}
        </ul>
      </div>
    );
  }
}

export default CommandContainer;
