import React, { Component } from 'react';
import { FormattedMessage } from 'umi/locale';
import cs from "classnames";
import styles from "./index.less";

class DownCount extends Component {

  state = {
    time : 5
  }

  componentDidMount(){
    this.downCount();
  }

  // 开始倒计时
  downCount = ()=>{
    const { modal } = this.props;
    setTimeout(()=>{
      const {time} = this.state;
      const newTime = time-1;
      if( newTime >= 0 ){
        this.setState({
          time :newTime
        });
        this.downCount();
      }else{
        modal.onOk();
        modal.close();
      }
    },1000);
  }


  render() {
    const { teacherName,taskType } = this.props;
    const { time } = this.state;
    return (
      <div className={styles.content}>
        <span className={cs('iconfont','icon-warning',styles['icon-warning'])} />
        <div className={styles.info}>
          {
            taskType === "TT_2" ? (
              <FormattedMessage
                id="task.text.practice.has.finish.by.teacher"
                values={{
                  "name":<span className={styles.tag}>{teacherName}</span>,
                  "time":time
                }}
                defaultMessage="练习已被{name}结束，将在 {time} 秒后返回列表！"
              />
            ) : (
              <FormattedMessage
                id="task.text.exam.has.finish.by.teacher"
                values={{
                  "name":<span className={styles.tag}>{teacherName}</span>,
                  "time":time
                }}
                defaultMessage="考试已被{name}结束，将在 {time} 秒后返回列表！"
              />
            )
          }
        </div>
      </div>
    );
  }
}

export default DownCount;
