import React from 'react';
import { Layout } from 'antd';
import LeftSide from "@/pages/Teacher/TaskList/leftSide";
import TaskSide from "@/pages/Teacher/Task/taskSide";
import styles from './sideLayout.less';

const { Sider, Content } = Layout;

class TaskList extends React.PureComponent {

  render() {
    const { children, route } = this.props;
    // 判断side页面
    let side = null;
    switch (route.name) {
      // 任务列表页面
      case "taskList":
        side = <LeftSide />;
        break;
      case "task":
      // 任务详情页面
        side = <TaskSide />;
        break;
      default:
        break;
    }


    return side ? (
      <Layout className={styles.layout}>
        <Sider width={250} className={styles.sider}>
          {side}
        </Sider>
        <Content className={styles.content} id="teacherReport">
          {children}
        </Content>
      </Layout>
    ) : (
      <Content className={styles.content}>
        {children}
      </Content>
    )
  }

}

export default TaskList;
