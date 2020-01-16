import React, { Component } from 'react';
import { connect } from "dva";
import { formatMessage } from 'umi/locale';
import { Button, Divider, Radio } from "antd";
import Link from 'umi/link';
import cs from 'classnames';
import styles from './leftSide.less';

@connect(({ teacher, dictionary }) =>{
  const { status, time, classType } = teacher.taskData;
  const { TASK_STATUS=[], TASK_QUERY_DATE=[], CLASSTYPE= [] } = dictionary;
  return {
    status,
    time,
    classType,
    TASK_STATUS,
    TASK_QUERY_DATE,
    CLASSTYPE
  }
})
class LeftSide extends Component {

  // 过滤条件的处理
  handleFilterParams = ()=>{
    const { TASK_STATUS, TASK_QUERY_DATE, CLASSTYPE } = this.props;

    // 按状态 默认只显示 TS_1~TS_5
    // 选中状态，多类型处理 如 选中 TS_1 实际要选中 TS_0
    // TS_0	准备中	TS_1
    // TS_0_1	打包中
    // TS_1	未开始
    // TS_2	进行中	TS_2
    // TS_3	评分中	TS_3
    // TS_4	已评分	TS_4
    // TS_5	已完成	TS_5
    // TS_6	已取消	不用理
    // TS_7	待处理
    // TS_8	打包失败
    const statusObj = {
      "TS_1" : "TS_0,TS_0_1,TS_1",
      "TS_2" : "TS_2",
      "TS_3" : "TS_3",
      "TS_4" : "TS_4",
      "TS_5" : "TS_5",
    };
    let status = [];
    if( TASK_STATUS.length > 0 ){
      status = Object.keys( statusObj ).map(item=>({...TASK_STATUS.find(tag=>tag.code===item)}));
    }
    return [
      {
        title: formatMessage({id:"task.title.by.status",defaultMessage:"按状态"}),
        key: 'status',
        list: [
          { code : "", value : formatMessage({id:"task.text.unlimited",defaultMessage:"不限"}) },
          ...status
        ]
      },
      {
        title: formatMessage({id:"task.text.by.time",defaultMessage:"按时间"}),
        key: 'time',
        list: [
          { code:"", value: formatMessage({id:"task.text.current.term",defaultMessage:"本学期"}) },
          ...TASK_QUERY_DATE ]
        },
      {
        title: formatMessage({id:"task.title.by.classType",defaultMessage:"按班级"}),
        key: 'classType',
        list: [
          { code : "", value : formatMessage({id:"task.text.unlimited",defaultMessage:"不限"}) },
          ...CLASSTYPE
        ]
      }
    ];
  }

  // 处理判断条件
  handleChange = (e) => {
    const { "data-select-key": selectKey, value } = e.target;
    const { dispatch } = this.props;
    // 更新列表
    dispatch({
      type    : 'teacher/getTaskData',
      payload : {
        [selectKey] : value,
        pageIndex : 1
      }
    });
  }

  render() {
    const { classType, status, time } = this.props;
    const params = { classType, status, time };
    const filterParams = this.handleFilterParams();

    // 列表选择项条件集合
    const checkboxGroup = filterParams.map((data) => (
      <div key={data.key}>
        <h4>{data.title}</h4>
        <Radio.Group onChange={this.handleChange} className={styles.group} name={data.key} value={params[data.key]}>
          { data.list.map((item)=>
            <Radio.Button key={item.code||item.value} size="small" className={styles['select-params']} data-select-key={data.key} value={item.code}>{item.value}</Radio.Button>
          )}
        </Radio.Group>
      </div>
    ));

    return (
      <div className={styles.content}>
        <Link to="/teacher/home">
          <Button className={styles["back-btn"]}>
            <span className={cs('iconfont','icon-back',styles['icon-back'])} />
            {formatMessage({id:"task.text.backHome",defaultMessage:"返回首页"})}
          </Button>
        </Link>
        <Divider style={{margin:"20px 0 12px 0"}} />
        {checkboxGroup}
      </div>
    );
  }
}
export default LeftSide;
