import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import Link from 'umi/link';
import { Icon, Breadcrumb, Input, Pagination, Spin, Button } from 'antd';
import cs from 'classnames';
import emptyImg from './assets/none_task_icon.png';
import TaskCard from './taskCard';
import styles from './index.less';

const { Search } = Input;

@connect(({ teacher, dictionary, loading }) => {
  const { taskData } = teacher;
  const { records = [], total, pageIndex, pageSize, filterWord, type } = taskData;
  const { TASK_TYPE = [] } = dictionary;
  const { value: taskTypeName } = TASK_TYPE.find(item => item.code === type) || {};
  const loadTaskList = loading.effects['teacher/getDistrictData'];

  return {
    recordsStr: JSON.stringify(records),
    total,
    pageIndex,
    pageSize,
    filterWord,
    type,
    taskTypeName, // 任务的名称 （ 练习，联考，考试 ）
    loadTaskList, // 加载列表
  };
})
class DistrictList extends Component {
  handleTaskId = ''; // 当前正在触发的taskId

  state = {
    // clickTaskId : "",       // 正在触发事件的 taskId 主要用于 按钮的loading效果
    pageIndex: 1,
  };

  componentDidMount() {
    localStorage.removeItem('publishReload');
    const { match } = this.props;
    // 获取任务列表数据
    this.getTaskData({ type: match.params.type });
  }

  // 获取任务列表数据
  getTaskData = (params = {}) => {
    const { dispatch } = this.props;
    if (params.pageIndex) {
      this.state.pageIndex = params.pageIndex;
    }
    dispatch({
      type: 'teacher/getDistrictData',
      payload: params,
    });
  };

  // 输入框的内容改变
  searchInputVal = e => {
    const { filterWord } = this.props;
    if (filterWord && e.target.value === '' && e.type === 'click') {
      this.getTaskData({ filterWord: '', pageIndex: 1 });
    }
  };

  // 发布
  releaseTask = () => {
    const { type } = this.props;
    router.push(`/teacher/examination/publish/${type}/configuration`);
  };

  // 绑定点击事件的taskId
  // clickBindTaskId = (taskId)=>{
  //   this.setState({clickTaskId:taskId});
  // }

  /**
   * 创建任务列表的tpl
   */
  renderTaskListTpl = () => {
    const { recordsStr } = this.props;
    const records = JSON.parse(recordsStr);

    // 判断是否为空
    if (records.length === 0) {
      return (
        <div className={styles['empty-list']}>
          <img src={emptyImg} alt="" />
          <div>
            {formatMessage({
              id: 'task.message.could.not.find.result',
              defaultMessage: '暂无搜索结果',
            })}
          </div>
        </div>
      );
    }

    // 生成 li 的列表
    const list = records.map((item, index) => {
      let showMore = true;
      // if(index>2){
      //   showMore = false
      // }

      if (item.status === 'TS_8' || item.status === 'TS_9') {
        showMore = false;
      }

      const { pageIndex } = this.state;
      return (
        <TaskCard
          // eslint-disable-next-line react/no-array-index-key
          key={`records_${index}`}
          data={item}
          {...item}
          showMore={showMore}
          onReload={() => {
            this.getTaskData({ pageIndex });
          }}
        />
      );
    });

    // 返回任务列表
    return <ul className={styles['task-list']}>{list}</ul>;
  };

  render() {
    const { total, pageIndex, pageSize, filterWord, loadTaskList, taskTypeName } = this.props;

    return (
      <div className={styles.content}>
        {/* 面包屑 */}
        <div className={styles.headbreadcrumb}>
          <Breadcrumb separator=">" className={styles.breadcrumb}>
            <Breadcrumb.Item>
              <Link to="/teacher">
                <Icon type="home" />
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{taskTypeName}</Breadcrumb.Item>
          </Breadcrumb>
          <Link to="/teacher/home" className={styles.linktext}>
            {/* <Button className={styles["back-btn"]}> */}
            <span className={cs('iconfont', 'icon-back', styles['icon-back'])} />
            {formatMessage({ id: 'task.text.backHome', defaultMessage: '返回首页' })}
            {/* </Button> */}
          </Link>
        </div>

        {/* 搜索框，创建任务 */}
        <div className={styles.head}>
          <Search
            className={styles.search}
            placeholder={formatMessage({
              id: 'task.placeholder.input.name.for.search',
              defaultMessage: '输入名称进行搜索',
            })}
            defaultValue={filterWord}
            maxLength={30}
            allowClear
            onSearch={value => this.getTaskData({ filterWord: value, pageIndex: 1 })}
            onChange={this.searchInputVal}
            enterButton
          />
          <Button
            className={cs(styles.refresh)}
            type="minor"
            shape="circle"
            onClick={() => this.getTaskData()}
            loading={loadTaskList}
          >
            {loadTaskList ? null : <Icon type="undo" rotate={90} />}
          </Button>
          {/* <Button
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
          </Button> */}
        </div>

        {/* 任务列表 */}
        <Spin spinning={loadTaskList}>{this.renderTaskListTpl()}</Spin>

        {/* 翻页组件 */}
        <Pagination
          style={{ textAlign: 'right' }}
          current={pageIndex}
          total={total}
          hideOnSinglePage
          pageSize={pageSize}
          onChange={page => this.getTaskData({ pageIndex: page })}
        />
      </div>
    );
  }
}
export default DistrictList;
