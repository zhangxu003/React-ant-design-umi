import React, { Component  } from 'react';
import {Button,Card,Dropdown,Menu } from 'antd';
import {connect} from "dva";
import Link from 'umi/link';
import cs from "classnames";
import SetTest from './Watch/Components/SetTest/api';
import styles from './taskSide.less';


@connect(({ task }) => ({
  id     : task.id,                         // 任务id
  name   : task.name,                       // 任务名称
  type   : task.type,                       // 任务类型
  status : task.status,                     // 任务状态
  classList : task.classList,               // 教室数组
  paperList : task.paperList                // 试卷数组
}))
class TaskSide extends Component {


  // 考试设置信息
  setTestInfo=()=>{
    SetTest({
      dataSource: {
        title: '提示'
      },
      callback: answersInfo => {
        console.log( answersInfo );
      },
    });
  }

  render() {

    const { name, type, classList, paperList} = this.props;

    // 班级菜单
    const classMenu = (
      <Menu>
        {classList.map(item=>(
          <Menu.Item key={item.classId}>{item.className}</Menu.Item>
        ))}
      </Menu>
    );

    // 试卷菜单
    const paperMenu = (
      <Menu>
        {paperList.map(item=>(
          <Menu.Item key={item.paperId}>{item.name}</Menu.Item>
        ))}
      </Menu>
    );

    return (
      <div className={styles.content}>

        <Link to="/teacher/tasklist/exam">
          <Button className={styles["back-btn"]}>
            <span className={cs('iconfont','icon-back',styles['icon-back'])} />返回任务列表
          </Button>
        </Link>

        <Card title="任务信息" className={styles.taskInfo}>
          <p>{name}</p>
          <ul className={styles.task}>
            <li>
              <Dropdown overlay={classMenu} trigger={['click']}>
                <span className={styles.setTests}>{classList.length}</span>
              </Dropdown>
              参与班级
            </li>
            <li>
              <Dropdown overlay={paperMenu} trigger={['click']}>
                <span className={styles.setTests}>{paperList.length}</span>
              </Dropdown>
              使用试卷
            </li>
          </ul>
          <div className={styles.setTests} onClick={this.setTestInfo}>
            考试设置信息<i className="iconfont icon-link-arrow" />
          </div>
        </Card>

        <Card title="情况统计" className={styles.taskInfo}>
          <ul>
            <li><span>200</span> 应考人数 </li>
            <li><span className={styles.sucess}>--</span> 考试成功</li>
            <li><span className={styles.noTest}>--</span> 未考人数</li>
            <li><span className={styles.failure}>--</span> 考试失败</li>
          </ul>
          <div className={styles.setTests}>查看详情<i className="iconfont icon-link-arrow" /></div>
        </Card>

      </div>
    );
  }
}
export default TaskSide;
