import React, { Component } from 'react';
import { FormattedMessage } from "umi/locale";
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
    setTimeout(()=>{
      const {time} = this.state;
      const newTime = time-1;
      if( newTime >= 0 ){
        this.setState({
          time :newTime
        });
        this.downCount();
      }else{
        // 刷新页面
        window.location.href="/";
      }
    },1000);
  }


  render() {
    const { teacherName } = this.props;
    const { time } = this.state;
    return (
      <div className={styles.content}>
        <span className={cs('iconfont','icon-warning',styles['icon-warning'])} />
        <div className={styles.info}>
          <FormattedMessage
            id="task.text.task.is.stop.by.teacher"
            defaultMessage="任务被 {name} 教师终止，{time} 秒后自动转到考试训练等待页！"
            values={{
              "name":<span className={styles.tag}>{teacherName}</span>,
              "time":time
            }}
          />
        </div>
      </div>
    );
  }
}

export default DownCount;
