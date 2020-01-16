import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import Link from 'umi/link';
import { Button, Icon, Breadcrumb, Input, Pagination, Spin } from 'antd';
import cs from 'classnames';
import moment from 'moment';
import emptyImg from "./assets/none_task_icon.png";
import TaskLi  from "./taskLi";
import styles from './index.less';

const { Search } = Input;

@connect(({ teacher, dictionary, loading }) =>{
  const { taskData } = teacher;
  const { records=[], total, pageIndex, pageSize, filterWord, type } = taskData;
  const { TASK_TYPE=[] } = dictionary;
  const { value : taskTypeName} = TASK_TYPE.find(item=>item.code===type) || {};
  const loadTaskList  = loading.effects['teacher/getTaskData'];

  return {
    recordsStr : JSON.stringify(records),
    total,
    pageIndex,
    pageSize,
    filterWord,
    type,
    taskTypeName,         // 任务的名称 （ 练习，联考，考试 ）
    loadTaskList,         // 加载列表
  };
})
class TaskList extends Component {

  handleTaskId = "";      // 当前正在触发的taskId

  state = {
    clickTaskId : "",       // 正在触发事件的 taskId 主要用于 按钮的loading效果
  }

  componentDidMount() {
    localStorage.removeItem("publishReload")
    const { match } = this.props;
    // 获取任务列表数据
    this.getTaskData({ type : match.params.type });
  }

  // 获取任务列表数据
   getTaskData = ( params={} )=>{
    const { dispatch } = this.props;
    dispatch({
      type    : 'teacher/getTaskData',
      payload : params
    });
  }

  // 输入框的内容改变
  searchInputVal =(e)=>{
    const { filterWord } = this.props;
    if( filterWord && e.target.value === "" && e.type==="click" ){
      this.getTaskData({filterWord:"",pageIndex:1})
    }
  }

  // 发布
  releaseTask = ()=>{
    const { type } = this.props;
    router.push(`/teacher/examination/publish/${type}/selectpaper`);
  }

  // 绑定点击事件的taskId
  clickBindTaskId = (taskId)=>{
    this.setState({clickTaskId:taskId});
  }

  /**
   * 创建任务列表的tpl
   */
  renderTaskListTpl = ()=>{
    const { recordsStr } = this.props;
    const { clickTaskId } = this.state;
    const records = JSON.parse( recordsStr );
    // 获取 昨天 和 今天
    const today = moment().format('YYYY-MM-DD');
    const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD')
    const replaceDate = ( date )=>{
      let result = date;
      const day = moment(date).format('dddd');
      if( date === today ){
        result = formatMessage({id:"task.text.today",defaultMessage:"今天"});
      }else if( date === yesterday ){
        result = formatMessage({id:"task.text.yesterday",defaultMessage:"昨天"});
      }
      return `${result} ${day}`;
    }

    // 判断是否为空
    if( records.length === 0 ){
      return (
        <div className={styles['empty-list']}>
          <img src={emptyImg} alt="" />
          <div>
            {formatMessage({id:"task.message.could.not.find.result",defaultMessage:"暂无搜索结果"})}
          </div>
        </div>
      )
    }

    // 先将列表 转换成 日期对象
    const obj = records.reduce((current,item)=>{
      const newCurrent = current;
      const groupDate = moment( item.examTime ).format('YYYY-MM-DD');
      newCurrent[groupDate] = current[groupDate] || [];
      newCurrent[groupDate].push(item);
      return newCurrent;
    },{});

    // 生成 li 的列表
    const list = Object.keys(obj).sort((a,b)=>a<b?1:-1).reduce((current,item)=>{
      // 添加日期时间
      current.push(<li className={styles.date} key={item}>{replaceDate(item)}</li> );
      // 添加列表信息
      obj[item].forEach(data=>{
        current.push(
          <TaskLi key={data.taskId} {...data} inProcessing={clickTaskId===data.taskId} clickBindTaskId={this.clickBindTaskId} />
        );
      });
      return current;
    },[]);

    // 返回任务列表
    return <ul className={styles['task-list']}>{list}</ul>;
  }

  render() {
    const { total, pageIndex, pageSize, filterWord, loadTaskList, taskTypeName } = this.props;

    return (
      <div className={styles.content}>

        {/* 面包屑 */}
        <Breadcrumb separator=">" className={styles.breadcrumb}>
          <Breadcrumb.Item><Link to="/teacher"><Icon type="home" /></Link></Breadcrumb.Item>
          <Breadcrumb.Item>{taskTypeName}</Breadcrumb.Item>
        </Breadcrumb>

        {/* 搜索框，创建任务 */}
        <div className={styles.head}>
          <Search
            className={styles.search}
            placeholder={formatMessage({id:"task.placeholder.input.name.for.search",defaultMessage:"输入名称进行搜索"})}
            maxLength={30}
            defaultValue={filterWord}
            allowClear
            onSearch={value=>this.getTaskData({filterWord:value,pageIndex:1})}
            onChange={this.searchInputVal}
            enterButton
          />
          <Button
            className={cs(styles.refresh)}
            type="minor"
            shape="circle"
            onClick={()=>this.getTaskData()}
            loading={loadTaskList}
          >
            {loadTaskList?null:<Icon type="undo" rotate={90} />}
          </Button>
          <Button
            className={cs(styles.add)}
            type="light"
            shape="round"
            icon="plus"
            onClick={this.releaseTask}
          >
            {formatMessage({id:"task.examination.publish.publish",defaultMessage:"发布"})}
          </Button>
        </div>

        {/* 任务列表 */}
        <Spin spinning={loadTaskList}>{this.renderTaskListTpl()}</Spin>

        {/* 翻页组件 */}
        <Pagination style={{textAlign:"right"}} current={pageIndex} total={total} hideOnSinglePage pageSize={pageSize} onChange={page=>this.getTaskData({pageIndex:page})} />

      </div>
    )
  }
}
export default TaskList;
