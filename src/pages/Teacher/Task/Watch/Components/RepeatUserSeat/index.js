import React, { Component } from 'react';
import { Modal,List } from 'antd';
import { formatMessage} from 'umi/locale';
import styles from './index.less';

class RepeatUserSeat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true
    };
  }

  componentDidMount() {}

  onHandleCancel = () => {
    const {props} = this
    this.setState({
      visible: false,
    });
    props.onClose();
  };

  onHandleOK = () => {
    const {props} = this
    const {values} = this.state;
    this.setState({
      visible: false,
    });
    props.callback(values)
    props.onClose();
  };



  render() {
    const { dataSource } = this.props;
    const {repeatStudent} = dataSource
    console.log(repeatStudent)
    const {visible} = this.state;
    return (
      <Modal
        visible={visible}
        centered="true"
        title={formatMessage({id:"task.text.Tips",defaultMessage:"提示"})}
        closable={false}
        width={505}
        maskClosable={false}
        cancelText={formatMessage({id:"task.button.cancel",defaultMessage:"取消"})}
        okText={formatMessage({id:"task.button.confirmBtn",defaultMessage:"确认"})}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        destroyOnClose="true"
        className={styles.attention}
      >
        <div>       
          <p className={styles.warning}><i className="iconfont icon-info-circle" />{formatMessage({id:"task.text.seatNumberIsDuplicated",defaultMessage:"座位号有重复，是否确认开始考试？"})}</p>
          {repeatStudent.map((vo)=>
            <ul className={styles.warnList} key={vo.ipAddress}>
              <li>
                <List
                  grid={{ gutter: 16, column: 3 }}
                  dataSource={vo}
                  renderItem={item => (
                    <List.Item>
                      
                      <span className={styles.repeatUserName}>{item.userName}</span> <span className={styles.inputLine}>{item.seatNo}</span>
                      
                    </List.Item>
                  )}
                />  
              </li>          
            </ul>
           )}
          {/* <ul className={styles.warnList}>
            <li>
            <List
              grid={{ gutter: 16, column: 3 }}
              dataSource={data}
              renderItem={item => (
              <List.Item>
                
                刘小强 <input value="01"/>
                
              </List.Item>
              )}
          />  
            </li>          
          </ul>
          <ul className={styles.warnList}>
            <li>
              <List
                grid={{ gutter: 30, column: 3 }}
                dataSource={data}
                renderItem={item => (
                <List.Item>
                  
                  刘小强 <input value="01"/>
                  
                </List.Item>
                )}
            />    
            </li>          
          </ul> */}
        </div>
      </Modal>
    );
  }
}

export default RepeatUserSeat;
