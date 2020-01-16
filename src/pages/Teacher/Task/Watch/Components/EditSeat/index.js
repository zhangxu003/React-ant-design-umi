import React, { Component } from 'react';
import { Modal,message,Input } from 'antd';
import { formatMessage} from 'umi/locale';
import styles from './index.less';

class EditSeat extends Component {
  constructor(props) {
    const {dataSource} = props;
    const {seatNo} =dataSource
    super(props);
    this.state = {
      visible: true,
      values:seatNo!==''?seatNo:''
    };
  }

  componentDidMount() {}

  onHandleCancel = () => {
    const {props} = this;
    this.setState({
      visible: false,
    });
    props.onClose();
  };

  onHandleOK = () => {
    const {props} = this;
    const {values} = this.state;
    this.setState({
      visible: false,
    });
    const re = /^[0-9]*[0-9][0-9]*$/;
    if (!re.test(values)) {
      message.warning(formatMessage({id:"task.text.Please-enter-the-correct-number-of-seats",defaultMessage:"请输入正确的数字座位号"}));
      props.onClose();
    } else {
      props.callback(values)
      props.onClose();
    }
  };



  saveAnswers=(e)=>{
    const re = /^[0-9]*[0-9][0-9]*$/;
    const {values} = this.state;
    console.log(e.target.value)
    if(e.target.value!==''&&values!==e.target.value) {
      console.log(e.target.value)
      if((e.target.value.length<3||e.target.value.length===3)&&re.test(e.target.value)) {
        this.setState({
          values: e.target.value,
        });
      } else if (!re.test(e.target.value)) {
        message.warning(formatMessage({id:"task.text.Please-enter-the-correct-number-of-seats",defaultMessage:"请输入正确的数字座位号"}));
      } else if(e.target.value.length>3){
        message.warning(formatMessage({id:"task.text.No-more-than -three-seats",defaultMessage:"座位号不能超过3位！"}))
      }
    } else {
      this.setState({
        values: '',
      });
    }

  }

  render() {
    const {values,visible} = this.state;
    const {dataSource} = this.props;
    const {seatNo} =dataSource
    console.log(seatNo,values)
    return (
      <Modal
        visible={visible}
        title={formatMessage({id:"task.text.editSeatNo",defaultMessage:"修改座位号"})}
        closable={false}
        width={501}
        maskClosable={false}
        cancelText={formatMessage({id:"task.button.cancel",defaultMessage:"取消"})}
        okText={formatMessage({id:"task.text.DetermineModifications",defaultMessage:"确定修改"})}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        style={{ top: 250 }}
        destroyOnClose="true"
      >
        <div className={styles.seat}>
          {formatMessage({id:"task.text.SeatNumber",defaultMessage:"座位号"})}<Input value={values} onChange={this.saveAnswers} />
        </div>
      </Modal>
    );
  }
}

export default EditSeat;
