import React from 'react';
import { connect } from 'dva';
import styles from './index.less';

// getTaskInfo
const {vb} = window;

@connect(({task})=>{
  const { taskInfo : { taskId } } = task;
  return {
    taskId
  }
})
class Task extends React.Component {

  componentDidMount() {
    // const { dispatch, match } = this.props;
    // // 获取任务详情
    // dispatch({
    //   type    : 'task/getTaskInfo',
    //   payload : match.params.id         // 任务id
    // });

    // 记录监考信息
    // const { dispatch, match } = this.props;
    // dispatch({
    //   type:'task/saveBatch',
    //   payload:{
    //     taskId : match.params.id,
    //     status : "1"
    //   }
    // })
  }

  componentDidUpdate(preProps){
    // 只有当获取到任务详情以后， 采取记录监考信息
    const { taskId, dispatch, match } = this.props;
    if( !preProps.taskId && taskId ){
      dispatch({
        type:'task/saveBatch',
        payload:{
          taskId : match.params.id,
          status : "1"
        }
      })
    }
  }

  componentWillUnmount(){
    // 退出监听页面的时候，清除VBClinet的通信
    vb.getSocketManager().onReceive(()=>{});
    // 清空拷贝数据
    const { dispatch } = this.props;
    dispatch({
      type : "task/copyTaskWathData",
      payload : []
    })
  }

  render() {
    const { children } = this.props;
    return (
      <div className={styles.containers}>
        {children}
      </div>
    );
  }
}
export default Task;
