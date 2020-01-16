import React, { Component } from 'react';
import { Modal, message } from 'antd';
import { formatMessage } from "umi/locale";
import './index.less';

class EditSeatNumberModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      value: props.dataSource.number,
    };
  }

  onHandleCancel = () => {
    const { onClose } = this.props;
    this.setState({
      visible: false,
    });

    onClose();
  };

  onHandleOK = () => {
    const { value } = this.state;
    const { callback, onClose } = this.props;
    if (value === "") {
      message.warning(formatMessage({id:"task.message.please.input.seat.no",defaultMessage:"请输入座位号"}));
      return;
    }

    callback(value);
    onClose();

    this.setState({
      visible: false,
    });
  };

  /**
   * @description: 修改座位号
   * @param {type}
   * @return:
   */
  changeSeatNumber = e => {
    let { value } = e.target;
    if (value.length > 3) {
      message.warning(formatMessage({id:"task.text.No-more-than -three-seats",defaultMessage:"座位号不能超过3位！"}));
    } else {
      value = value.replace(/[^0-9]/gi, '');
      if (value) {
        value = Number(value);
      }
      this.setState({ value });
    }
  };

  render() {
    const { dataSource } = this.props;
    const { visible, value } = this.state;
    return (
      <Modal
        visible={visible}
        centered
        title={dataSource.title}
        closable={false}
        maskClosable={false}
        cancelText={formatMessage({id:"task.button.cancel",defaultMessage:"取消"})}
        okText={formatMessage({id:"task.text.DetermineModifications",defaultMessage:"确定修改"})}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className="editSeatNumberModal"
        width={500}
      >
        <div className="item">
          <div>{formatMessage({id:"task.text.SeatNumber",defaultMessage:"座位号"})}</div>
          <input
            step="1"
            placeholder={formatMessage({id:"task.placeholder.please.input.seat.no",defaultMessage:"输入座位号"})}
            type="text"
            value={value}
            onChange={this.changeSeatNumber}
          />
        </div>
      </Modal>
    );
  }
}

export default EditSeatNumberModal;
