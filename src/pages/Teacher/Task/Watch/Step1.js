import React from 'react';
import { List, Card, Dropdown, Menu, message } from 'antd';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import { sendMS, closeStudent } from '@/utils/instructions';
import { proxyTokenDelete } from '@/services/teacher';
import { connect } from 'dva';
import Modal from '@/components/Modal';
import EditSeat from './Components/EditSeat/api';
import styles from './index.less';
import studentHead from '@/assets/none_card_icon.png';

const { vb } = window;
// 一键检测的时间
let autoCheckTime = 1000;
if (process.env.NODE_ENV === 'development') {
  autoCheckTime = 10 * 1000;
}

@connect(({ task, teacher }) => {
  const {
    userInfo: { accountId },
  } = teacher;
  const { taskInfo, students, showNewModal } = task;
  const {
    taskPaperIdList,
    taskStudentRelationVOList,
    distributeType,
    examType,
    taskId,
    type,
    name,
    classList,
    campusId,
  } = taskInfo;
  return {
    accountId,
    taskPaperIdList,
    taskStudentRelationVOList,
    distributeType,
    examType,
    taskId,
    type,
    name,
    students,
    classList,
    showNewModal,
    campusId,
  };
})
class Step1 extends React.PureComponent {
  endPaperTime = 0;

  state = {};

  componentDidMount() {
    const { match, type } = this.props;
    const that = this;
    // 间隔时长
    console.log(match);
    if (type === 'TT_2') {
      // 如果学生进入练习则直接跳到等待开始练习状态
      router.push('/teacher/task/'.concat(match.params.id).concat('/watch/step2'));
    }
    if (match.params.id === 'autoCheck') {
      // 固定两分钟发送允许登录指令并跳转页面
      this.endPaperTime = setTimeout(() => {
        const { students, taskStudentRelationVOList, taskId, name, examType } = that.props;
        console.log(students);
        console.log('10000');
        if (students.length > 0) {
          // 允许登录指令command:openAuto 单个发送，发送的对象通过vb.clients获取，该指令中含有考号
          students.forEach((item, index) => {
            const data = {
              taskId, // 任务ID
              description: name, // 任务描述
              paperpolicy: examType, // 试卷的发放策略
              id:
                taskStudentRelationVOList &&
                taskStudentRelationVOList[index] &&
                taskStudentRelationVOList[index].examNo,
            };
            sendMS('openauto', data, item.connId);
          });
          router.push(`/teacher/task/`.concat(match.params.id).concat(`/watch/step2`));
        } else {
          // 当连接数为0，结束本次任务，转到生成检测报告
          router.push('/teacher/task/'.concat(match.params.id).concat('/watch/step4'));
        }
      }, autoCheckTime);
    }
  }

  componentDidUpdate(prevProps) {
    const { taskId } = this.props;
    if (taskId !== prevProps.taskId) {
      clearTimeout(this.endPaperTime);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.endPaperTime);
  }

  /**
   * @description 修改座位号
   * @memberof Step1
   */
  editSeatUser = (currentIp, connID, seatNo) => {
    EditSeat({
      dataSource: {
        title: '提示',
        seatNo,
      },
      callback: userSeatNumber => {
        const data = {
          ipAddr: currentIp, // 学生机IP
          number: Number(userSeatNumber), // 座位号
        };
        sendMS('modify:number', data, connID);
      },
    });
  };

  /**
   * @description 允许登录
   * @memberof Step1
   */
  startTest = () => {
    console.log('允许登录--click', Date.now());
    const { taskId, name, examType, students, match, accountId, campusId } = this.props;
    // 添加保存数据缓存
    const obj = {
      teacherAction: '01',
      task_id: taskId,
      monitorInfo: students,
      campusId,
    };

    // end
    const data = {
      taskId, // 任务ID
      description: name, // 任务描述
      paperpolicy: examType, // 试卷的发放策略
    };
    // 非一键检测允许点击
    if (taskId !== 'autoCheck') {
      vb.getStorageManager().set({ key: accountId, value: JSON.stringify(obj) });
      console.log('允许登录--sendMS--open--begin', Date.now());
      sendMS('open', data, '');
      console.log('允许登录--sendMS--open--end', Date.now());
      router.push('/teacher/task/'.concat(match.params.id).concat('/watch/step2'));
    }
  };

  // 关闭学生机二次确认框
  beforeCloseStudent = (ip, connID, userName, seatNo, monitoringStatus) => {
    if (monitoringStatus === 'MS_10') {
      return;
    }
    Modal.confirm({
      title: null,
      width: 400,
      content: (
        <span>
          {formatMessage({ id: 'task.text.yesornoclose', defaultMessage: '是否关闭' })}{' '}
          <span className={styles['del-task']}>
            {seatNo} {userName || ip}
          </span>{' '}
          {formatMessage({ id: 'task.text.yesornoclosed', defaultMessage: '的学生机？' })}
        </span>
      ),
      icon: null,
      centered: true,
      okText: '是',
      cancelText: '否',
      okButtonProps: {
        type: 'warn',
        shape: 'round',
      },
      cancelButtonProps: {
        shape: 'round',
      },
      onOk: async () => {
        this.closeStudent(ip, connID);
      },
    });
  };

  /**
   * @description 关闭学生机
   * @memberof Step1
   */
  closeStudent = (ip, connID) => {
    //   const data = {
    //     "ipAddr":ip
    // }
    const v = 'student_';
    const userIp = v + ip;
    proxyTokenDelete(userIp).then(res => {
      if (res.responseCode !== '200') {
        message.warning(res.data);
      }
    });
    // sendMS('close',data,connID)
    closeStudent(connID);
  };

  /**
   * @description 显示学生总数搜索抽屉
   * @memberof showDrawerSider
   */
  showDrawerSider = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'task/updateDrawer',
      payload: {
        showDrawer: true,
      },
    });
  };

  /**
   * @description 显示新增学生列表
   * @memberof showNewModal
   */
  showNewModalVisible = () => {
    const { dispatch, showNewModal } = this.props;
    dispatch({
      type: 'task/updateDrawer',
      payload: {
        showNewModal: !showNewModal,
      },
    });
  };

  render() {
    const { type } = this.props;
    const menu = (sid, connId, seatNo, userName, monitoringStatus) => (
      <Menu className="oper">
        <Menu.Item key="1" onClick={() => this.editSeatUser(sid, connId, seatNo)}>
          <i className="iconfont icon-edit" />
          {formatMessage({ id: 'task.text.editSeatNo', defaultMessage: '修改座位号' })}
        </Menu.Item>
        <Menu.Item
          key="2"
          onClick={() => this.beforeCloseStudent(sid, connId, userName, seatNo, monitoringStatus)}
          className={monitoringStatus === 'MS_10' ? 'disabled' : ''}
        >
          <i className="iconfont icon-shut_down" />
          {formatMessage({ id: 'task.text.closeStudent', defaultMessage: '关闭学生机' })}
        </Menu.Item>
      </Menu>
    );
    const { students, taskStudentRelationVOList } = this.props;
    const newAdd = taskStudentRelationVOList.filter(
      vo => vo.examFlag && vo.examFlag !== '' && vo.examFlag !== null && vo.status === 'Y'
    );
    return (
      <div className={styles.steps}>
        <div className={styles.agreeLogin} onClick={this.startTest} />
        <div className={styles.step}>
          <span className={styles.connected}>
            {formatMessage({ id: 'task.text.all', defaultMessage: '全部' })}({students.length})
          </span>
          <div className={styles.notices}>
            {type === 'TT_6' && newAdd.length > 0 && (
              <i className="iconfont icon-bell" onClick={this.showNewModalVisible} />
            )}
            {/* <div className={styles.counts} onClick={this.showDrawerSider}>
              <i className="iconfont icon-user" />
              {type==='TT_2'?formatMessage({id:"task.text.practicedStudent",defaultMessage:"应练学生"}):formatMessage({id:"task.text.teacher.task.watch.step1.testStudents",defaultMessage:"应考学生"})}({taskStudentRelationVOList.filter(data => data.status === "Y").length})
              <Icon className={styles.icon} type="caret-down" theme="filled" color="#000000" />
            </div> */}
          </div>
        </div>
        {students.length === 0 && (
          <div className={styles.emptyNoData}>
            <img src={studentHead} alt="" />
            {formatMessage({ id: 'task.text.noData', defaultMessage: '暂无数据' })}
          </div>
        )}
        {students.length > 0 && (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 4 }}
            dataSource={students}
            renderItem={item => (
              <Dropdown
                overlay={menu(
                  item.ipAddress,
                  item.connId,
                  item.seatNo,
                  item.userName,
                  item.monitoringStatus
                )}
                trigger={['contextMenu']}
              >
                <List.Item>
                  <Card title={item.ipAddress}>
                    <div className={styles.main}>
                      <div className={styles.status}>
                        <span className={styles.seatNumber}>
                          {item.seatNo !== '' ? item.seatNo : '--'}
                        </span>
                        <span className={styles.connect}>
                          {formatMessage({ id: 'task.text.connected', defaultMessage: '已连接' })}
                        </span>
                      </div>
                      <div className={styles.detail}>
                        <div className={styles.student}>
                          <span className={styles.studentName}>---</span>{' '}
                          {formatMessage({ id: 'task.text.studentCode', defaultMessage: '考号' })}{' '}
                          ---
                        </div>
                        <div className={styles.percent}>
                          <span className={styles.percentTitle}>
                            {formatMessage({
                              id: 'task.text.processAnswer',
                              defaultMessage: '答题进度',
                            })}
                          </span>
                          --
                        </div>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              </Dropdown>
            )}
          />
        )}
      </div>
    );
  }
}
export default Step1;
