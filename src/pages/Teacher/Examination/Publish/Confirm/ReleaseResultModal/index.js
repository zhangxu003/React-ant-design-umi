import React, { Component } from 'react';
import { Modal} from 'antd';
import './index.less';
class ReleaseResultModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
          visible: true,
          distribution:'',
          strategy:[]
        };
      }      
    onHandleCancel = () => {
        this.setState({
        visible: false,
        });
        this.props.onClose();
    };
    onHandleOK = () => {
        this.setState({
        visible: false,
        });
        this.props.callback();
        this.props.onClose();
        
    };
      render(){
          return(<Modal
            visible={this.state.visible}
            centered={true}
            title={this.props.dataSource.result}
            maskClosable={false}
            closable={false}
            cancelText=""
            okText="我知道了"
            onCancel={this.onHandleCancel}
            onOk={this.onHandleOK}
            className="ReleaseResult"       
          >
            <div className="ReleaseResultTips">
            请告知参加本次考试、练习、联考的考生，他的考号为班级序号+学号，
                如：初一（1）班 学号为10的考生的考号为： 0110
            </div>
          </Modal>)
      }
    
}
export default ReleaseResultModal