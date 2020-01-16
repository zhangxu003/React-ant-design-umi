import React, { isValidElement } from 'react';
import { Modal } from 'antd';

const { info, success, error, warning, confirm } = Modal;

// @HACH
/* eslint-disable no-underscore-dangle */
const base = tag => (opt = {}) => {
  const { content, ...params } = opt;

  // 如果content不是reactElement元素
  if (!isValidElement(content)) {
    const modal = tag({
      ...opt,
    });
    return modal;
  }

  // 如果是dom元素
  const modal = tag({
    ...params,
  });

  // 设置确认按钮的事件
  const setOk = fn => {
    if (fn && typeof fn === 'function') {
      modal.update({
        onOk: fn,
      });
    }
  };

  // 设置取消按钮的事件
  const setCancel = fn => {
    if (fn && typeof fn === 'function') {
      modal.update({
        onCancel: fn,
      });
    }
  };

  // 设置全局事件
  const update = opts => {
    modal.update({
      ...opts,
    });
  };

  // 关闭弹框的方式
  const close = ()=>{
    modal.destroy();
  }

  const children = window.g_app._getProvider(param => {
    const { content: newContent } = param;
    return React.cloneElement(newContent, {
      modal: {
        ...modal,
        ...params,
        setOk,
        setCancel,
        update,
        close
      },
    });
  })({ content });

  modal.update({
    content: children,
  });

  return modal;
};

const defaultOpt = {
  centered: true, // 是否居中显示
  destroyOnClose: true, // 关闭后销毁子元素
  maskClosable: false, // 是否允许点击遮罩层关闭弹框
};

class PopupModal extends React.Component {
  /**
   * 初始化配置数据
   */
  state = {
    options: defaultOpt,
  };

  componentWillReceiveProps(nextProps) {
    const { visible } = nextProps;
    const { visible: current } = this.props;
    // 关闭弹框后清空当前的页面状态
    if (visible === false && current) {
      setTimeout(() => {
        this.setState({ options: defaultOpt });
      }, 300);
    }
  }

  /**
   * @description: 绑定modal的onOk事件
   * @param {type}
   * @return:
   */
  setOk = fn => {
    this.setState(state => ({
      options: {
        ...state.options,
        onOk: fn,
      },
    }));
  };

  /**
   * @description: 绑定modal的onCancel事件
   * @param {type}
   * @return:
   */
  setCancel = fn => {
    this.setState(state => ({
      options: {
        ...state.options,
        onCancel: fn,
      },
    }));
  };

  /**
   * @description: 绑定modal的全部配置参数
   * @param {type}
   * @return:
   */
  update = options => {
    this.setState(state => ({
      options: {
        ...state.options,
        ...options,
      },
    }));
  };

  render() {
    const { children, ...params } = this.props;
    const { options } = this.state;
    const item = { ...params, ...options };
    item.visible = Boolean(item.visible);
    const newChildren = React.cloneElement(children, {
      modal: {
        ...item,
        setOk: this.setOk,
        setCancel: this.setCancel,
        update: this.update,
      },
    });
    return <Modal {...item}>{newChildren}</Modal>;
  }
}

PopupModal.info = base(info);
PopupModal.success = base(success);
PopupModal.error = base(error);
PopupModal.warning = base(warning);
PopupModal.confirm = base(confirm);
PopupModal.destroyAll = Modal.destroyAll;

export default PopupModal;
