import React, { Component } from 'react';
import { List, Card, Tabs, Dropdown, Menu, message, Tooltip } from 'antd';
import { formatMessage } from 'umi/locale';
import cn from 'classnames';
import router from 'umi/router';
import { connect } from 'dva';
import Attention from './Components/Attention/api';
import EditSeat from './Components/EditSeat/api';
import { proxyTokenDelete } from '@/services/teacher';
import Modal from '@/components/Modal';
import { sendMS, closeStudent } from '@/utils/instructions';
import { switchStatus } from './watching';
import studentHead from '@/assets/none_card_icon.png';
import styles from './index.less';

const { vb } = window;
const { TabPane } = Tabs;

// 一键检测的时间
let autoCheckTime = 2 * 60 * 1000;
if (process.env.NODE_ENV === 'development') {
  autoCheckTime = 60 * 1000;
}

@connect(({ task, teacher }) => {
  const {
    userInfo: { accountId },
  } = teacher;
  const { taskInfo, students, filterStudents, conditions } = task;
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
    taskPaperIdList,
    taskStudentRelationVOList,
    distributeType,
    examType,
    taskId,
    type,
    name,
    students,
    classList,
    accountId,
    campusId,
    filterStudents,
    conditions,
  };
})
class Step2 extends Component {
  endPaperTime = 0;

  state = {};

  componentDidMount() {
    const ipAddressTeacher = localStorage.getItem('ipAddress');
    console.log('进入开始考试页面--sendMS--student:getstatus--begin', Date.now());
    sendMS('student:getstatus', {
      ipAddr: ipAddressTeacher,
    });
    console.log('进入开始考试页面--sendMS--student:getstatus--end', Date.now());
    const that = this;
    const { taskId } = this.props;
    // 间隔时长
    if (taskId === 'autoCheck') {
      // 允许登录后两分钟发送开始考试指令并跳转监控页
      this.endPaperTime = setTimeout(() => {
        const { students, type, dispatch, match } = that.props;
        console.log(students);
        let status = 0;
        students.forEach((_, index) => {
          if (students[index].monitoringStatus === 'MS_6') {
            status = 1;
          }
        });
        if (status) {
          const params = {
            taskId, // 任务ID
            taskType: type, // 任务类型
          };
          const student = JSON.parse(JSON.stringify(students));
          student.forEach((_, index) => {
            if (student[index].monitoringStatus === 'MS_6') {
              student[index].examStatus = 'ES_2';
            }
          });
          // 更新学生列表信息
          dispatch({
            type: 'task/updateLinking',
            payload: {
              students: student,
            },
          });
          sendMS('start:manual', params, '');
          // 跳转到开始考试
          router.push('/teacher/task/'.concat(match.params.id).concat('/watch/step3'));
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

  // 保存缓存
  saveCacheData = () => {
    const { taskId, students, accountId, campusId } = this.props;
    const currentTime = new Date().getTime();
    console.log(currentTime);
    // 添加保存数据缓存
    const obj = {
      teacherAction: '02',
      task_id: taskId,
      monitorInfo: students,
      campusId,
      startTime: currentTime,
    };
    if (taskId !== 'autoCheck') {
      vb.getStorageManager().set({ key: accountId, value: JSON.stringify(obj) });
    }
  };

  /**
   * @description 更新学生状态开始考试
   * @memberof agreeTest
   */
  agreeTest = () => {
    const { dispatch, taskId, type, students, match } = this.props;
    const params = {
      taskId, // 任务ID
      taskType: type, // 任务类型
    };
    const student = JSON.parse(JSON.stringify(students));
    student.forEach((_, index) => {
      if (student[index].monitoringStatus === 'MS_6') {
        // student[index].monitoringStatus = 'MS_8'
        student[index].examStatus = 'ES_2';
      }
    });
    // 更新学生列表信息
    dispatch({
      type: 'task/updateLinking',
      payload: {
        students: student,
      },
    });

    // 添加保存数据缓存
    this.saveCacheData();
    // end
    sendMS('start:manual', params, '');
    // 跳转到开始考试
    router.push('/teacher/task/'.concat(match.params.id).concat('/watch/step3'));
  };

  /**
   * @description 开始考试
   * @memberof startTest
   */
  startTest = () => {
    const { taskId, type, match } = this.props;
    // 如果此为练习则发送允许登录指令并跳到开始练习页面
    if (type === 'TT_2') {
      const { distributeType, name } = this.props;
      // 跳转到开始考试
      // 添加保存数据缓存
      this.saveCacheData();

      // end
      const data = {
        taskId, // 任务ID
        description: name, // 任务描述
        paperpolicy: distributeType, // 试卷的发放策略
      };

      sendMS('open', data, '');
      router.push('/teacher/task/'.concat(match.params.id).concat('/watch/step3'));
    } else if (taskId !== 'autoCheck') {
      // 非一键检测允许点击
      const { students } = this.props;
      const that = this;
      Attention({
        dataSource: {
          title: formatMessage({ id: 'task.title.Candidates', defaultMessage: '考生情况' }),
          students,
        },
        callback: () => {
          that.agreeTest();
        },
      });
    }
  };

  /**
   * @description 修改座位号
   * @memberof editSeatUser
   */
  editSeatUser = (currentIp, connID, seatNo) => {
    EditSeat({
      dataSource: {
        title: formatMessage({ id: 'task.title.tips', defaultMessage: '提示' }),
        seatNo,
      },
      callback: userSeatNumber => {
        const data = {
          ipAddr: currentIp, // 学生机IP
          number: Number(userSeatNumber), // 座位号
        };
        sendMS('modify:number', data, connID);
        // 添加保存数据缓存 需在座位号修改完成回调后再保存缓存
        // that.saveCacheData()
      },
    });
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
      okText: formatMessage({ id: 'task.button.yes', defaultMessage: '是' }),
      cancelText: formatMessage({ id: 'task.button.no', defaultMessage: '否' }),
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
   * @memberof closeStudent
   */
  closeStudent = (ip, connID) => {
    const { accountId, campusId } = this.props;
    // const data = {
    //   "ipAddr":ip
    // }
    const v = 'student_';
    const userIp = v + ip;
    proxyTokenDelete(userIp).then(res => {
      if (res.responseCode !== '200') {
        message.warning(res.data);
      }
    });
    const { taskId, students, dispatch, filterStudents, conditions } = this.props;
    const student = JSON.parse(JSON.stringify(students));
    const filterStudent = JSON.parse(JSON.stringify(filterStudents));
    student.forEach((item, index) => {
      if (item.ipAddress === ip) {
        student.splice(index, 1);
      }
    });
    filterStudent.forEach((item, index) => {
      if (item.ipAddress === ip) {
        filterStudent.splice(index, 1);
      }
    });
    dispatch({
      type: 'task/savefilterTaskWathData',
      payload: {
        filterStudent,
        conditions,
      },
    });

    // 更新学生列表信息
    dispatch({
      type: 'task/updateLinking',
      payload: {
        students: student,
      },
    });
    // 添加保存数据缓存
    const obj = {
      teacherAction: '01',
      task_id: taskId,
      monitorInfo: student,
      campusId,
    };
    if (taskId !== 'autoCheck') {
      vb.getStorageManager().set({ key: accountId, value: JSON.stringify(obj) });
    }
    // sendMS('close',data,connID);
    closeStudent(connID);
  };

  // 重置登录二次确认框
  beforeResetLogin = (ip, connID, userName) => {
    Modal.confirm({
      title: null,
      width: 400,
      content: (
        <span>
          {formatMessage({ id: 'task.text.yesornoreset', defaultMessage: '是否重置' })}{' '}
          <span className={styles['del-task']}>{userName || ip}</span>{' '}
          {formatMessage({ id: 'task.text.yesornoreseted', defaultMessage: '的登录状态？' })}
        </span>
      ),
      icon: null,
      centered: true,
      okText: formatMessage({ id: 'task.button.yes', defaultMessage: '是' }),
      cancelText: formatMessage({ id: 'task.button.no', defaultMessage: '否' }),
      okButtonProps: {
        type: 'warn',
        shape: 'round',
      },
      cancelButtonProps: {
        shape: 'round',
      },
      onOk: async () => {
        this.resetLogin(ip, connID);
      },
    });
  };

  /**
   * @description 重置登录
   * @memberof resetLogin
   */
  resetLogin = (ip, connID) => {
    const { students, dispatch } = this.props;
    const data = {
      ipAddr: ip,
    };
    const v = 'student_';
    const userIp = v + ip;
    proxyTokenDelete(userIp).then(res => {
      if (res.responseCode === '200') {
        sendMS('clean', data, connID);
        const result = JSON.parse(JSON.stringify(students));
        result.forEach((item, index) => {
          if (ip === item.ipAddress) {
            result[index].paperName = '';
            result[index].userName = '';
            result[index].identifyCode = '';
            result[index].monitoringStatus = 'MS_1';
            result[index].studentId = '';
            result[index].monitoringId = '';
            result[index].classId = '';
            result[index].screening = '';
          }
        });
        // 更新学生列表信息
        dispatch({
          type: 'task/updateLinking',
          payload: {
            students: result,
          },
        });
        const { taskId } = this.props;
        // 添加保存数据缓存
        const { accountId, campusId } = this.props;
        const obj = {
          teacherAction: '01',
          task_id: taskId,
          monitorInfo: result,
          campusId,
        };
        if (taskId !== 'autoCheck') {
          vb.getStorageManager().set({ key: accountId, value: JSON.stringify(obj) });
        }
      } else {
        message.warning(res.data);
      }
    });
    // sendMS('exit',data,connID)
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
   * @description 渲染Item
   * @memberof showItem
   */
  showItem = item => (
    <Card
      title={item.ipAddress}
      className={item.monitoringStatus === 'MS_10' ? 'studentIpOrange' : ''}
    >
      <div className={styles.main}>
        <div className={styles.status}>
          <div className={styles.examFlagStatus}>
            {item.examFlag && (
              <div>
                {item.examFlag.split(',').map(vo =>
                  vo === 'APPLY' ? (
                    <Tooltip
                      title={formatMessage({
                        id: 'task.text.on.site.registration',
                        defaultMessage: '现场报名',
                      })}
                      className={styles.news}
                    >
                      {formatMessage({
                        id: 'task.text.text.on.site.newspaper',
                        defaultMessage: '报',
                      })}
                    </Tooltip>
                  ) : (
                    vo === 'MAKE_UP_EXAM' && (
                      <Tooltip
                        title={`${formatMessage({
                          id: 'task.text.Make.up.Examination',
                          defaultMessage: '已补考',
                        })}${item.makeUpCount || 0}${formatMessage({
                          id: 'task.text.exam.second.count',
                          defaultMessage: '次',
                        })}`}
                        className={styles.makeup}
                      >
                        {formatMessage({ id: 'task.text.repair', defaultMessage: '补' })}
                      </Tooltip>
                    )
                  )
                )}
              </div>
            )}
          </div>

          <span className={cn(styles.seatNumber, 'connect'.concat(item.monitoringStatus))}>
            {item.seatNo !== '' ? item.seatNo : '--'}
          </span>
          <span className={cn(styles.connect, 'connect'.concat(item.monitoringStatus))}>
            {switchStatus(item.monitoringStatus)}
          </span>
        </div>
        <div className={styles.detail}>
          <div className={item.paperName ? '' : styles.student}>
            <span className={styles.studentName}>
              <Tooltip title={item.userName || '---'}>{item.userName || '---'}</Tooltip>
            </span>
            <span className={styles.studentNumber}>
              {formatMessage({ id: 'task.text.studentCode', defaultMessage: '考号' })}{' '}
              <Tooltip title={item.identifyCode ? item.identifyCode : ''}>
                {item.identifyCode ? item.identifyCode : '---'}
              </Tooltip>
            </span>
            <br />
            <div className={item.paperName ? styles.paperName : ''}>
              <Tooltip title={item.paperName}>{item.paperName}</Tooltip>
            </div>
          </div>
          <div className={styles.percent}>
            <span className={styles.percentTitle}>
              {formatMessage({ id: 'task.text.processAnswer', defaultMessage: '答题进度' })}
            </span>{' '}
            --
          </div>
        </div>
      </div>
    </Card>
  );

  /**
   * @description 渲染空数据
   * @memberof showItem
   */
  emptyNoData = () => (
    <div className={styles.emptyNoData}>
      <img src={studentHead} alt="" />
      {formatMessage({ id: 'task.text.noData', defaultMessage: '暂无数据' })}
    </div>
  );

  /**
   * @description 显示新增学生列表
   * @memberof showNewModal
   */
  showNewModalVisible = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'task/updateDrawer',
      payload: {
        showNewModal: false,
      },
    });
  };

  // 切换不同tab 暂存当前tab数据
  changeStatus = key => {
    console.log(key);
    const { dispatch, students } = this.props;
    if (key === '1') {
      dispatch({
        type: 'task/filterTaskWathData',
        payload: {
          filterStudent: students,
          conditions: key,
        },
      });
    }
    if (key === '2') {
      dispatch({
        type: 'task/filterTaskWathData',
        payload: {
          filterStudent: students.filter(data => data.monitoringStatus === 'MS_6'),
          conditions: key,
        },
      });
    }
    if (key === '3') {
      dispatch({
        type: 'task/filterTaskWathData',
        payload: {
          filterStudent: students.filter(data => data.monitoringStatus !== 'MS_6'),
          conditions: key,
        },
      });
    }
  };

  render() {
    const { students, taskStudentRelationVOList, type, filterStudents } = this.props;
    console.log(filterStudents);
    const menu = (sid, connId, seatNo, userName, monitoringStatus) =>
      type === 'TT_2' ? (
        <Menu className="oper">
          <Menu.Item key="1" onClick={() => this.editSeatUser(sid, connId, seatNo)}>
            <i className="iconfont icon-edit" />
            {formatMessage({ id: 'task.text.editSeatNo', defaultMessage: '修改座位号' })}
          </Menu.Item>
          <Menu.Item
            key="4"
            onClick={() => this.beforeCloseStudent(sid, connId, userName, seatNo, monitoringStatus)}
            className={monitoringStatus === 'MS_10' ? 'disabled' : ''}
          >
            <i className="iconfont icon-shut_down" />
            {formatMessage({ id: 'task.text.closeStudent', defaultMessage: '关闭学生机' })}
          </Menu.Item>
        </Menu>
      ) : (
        <Menu className="oper">
          <Menu.Item key="1" onClick={() => this.editSeatUser(sid, connId, seatNo)}>
            <i className="iconfont icon-edit" />
            {formatMessage({ id: 'task.text.editSeatNo', defaultMessage: '修改座位号' })}
          </Menu.Item>
          <Menu.Item key="3" onClick={() => this.beforeResetLogin(sid, connId, userName)}>
            <i className="iconfont icon-back" />
            {formatMessage({ id: 'task.text.resetLogin', defaultMessage: '重置登录' })}
          </Menu.Item>
          <Menu.Item
            key="4"
            onClick={() => this.beforeCloseStudent(sid, connId, userName, seatNo, monitoringStatus)}
            className={monitoringStatus === 'MS_10' ? 'disabled' : ''}
          >
            <i className="iconfont icon-shut_down" />
            {formatMessage({ id: 'task.text.closeStudent', defaultMessage: '关闭学生机' })}
          </Menu.Item>
        </Menu>
      );
    const newAdd = taskStudentRelationVOList.filter(
      vo => vo.examFlag && vo.examFlag !== '' && vo.examFlag !== null && vo.status === 'Y'
    );
    return (
      <div className={styles.steps}>
        <div
          className={styles.startTest}
          onClick={this.startTest}
          style={type === 'TT_2' ? { marginLeft: '-137px' } : {}}
        />
        <div className={styles.step}>
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
        <Tabs defaultActiveKey="1" animated={false} onChange={this.changeStatus}>
          <TabPane
            tab={
              type === 'TT_2' ? (
                <span className={styles.connected}>
                  {formatMessage({ id: 'task.text.all', defaultMessage: '全部' })}({students.length}
                  )
                </span>
              ) : (
                <span className={cn(styles.connecting, styles.statusNow, 'connecting')}>
                  全部 ({students.length})
                </span>
              )
            }
            key="1"
          >
            {students.length === 0 && this.emptyNoData()}
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
                    <List.Item>{this.showItem(item)}</List.Item>
                  </Dropdown>
                )}
              />
            )}
          </TabPane>
          {type !== 'TT_2' && (
            <TabPane
              tab={
                <span className={cn(styles.connecting, styles.statusNow, 'connecting')}>
                  <i />
                  {formatMessage({ id: 'task.title.tabwaitstart', defaultMessage: '等待开始' })} (
                  {students.filter(data => data.monitoringStatus === 'MS_6').length})
                </span>
              }
              key="2"
            >
              {filterStudents.length === 0 && this.emptyNoData()}
              {filterStudents.length > 0 && (
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 4 }}
                  dataSource={filterStudents}
                  renderItem={item =>
                    item.monitoringStatus === 'MS_6' ? (
                      <Dropdown
                        overlay={menu(item.ipAddress, item.connId, item.seatNo, item.userName)}
                        trigger={['contextMenu']}
                      >
                        <List.Item>{this.showItem(item)}</List.Item>
                      </Dropdown>
                    ) : (
                      <List.Item className={styles.notAllow}>{this.showItem(item)}</List.Item>
                    )
                  }
                />
              )}
            </TabPane>
          )}
          {type !== 'TT_2' && (
            <TabPane
              tab={
                <span className={cn(styles.excepted, styles.statusNow, 'excepted')}>
                  <i />
                  {formatMessage({ id: 'task.title.tabnostart', defaultMessage: '未准备就绪' })} (
                  {students.filter(data => data.monitoringStatus !== 'MS_6').length})
                </span>
              }
              key="3"
            >
              {filterStudents.length === 0 && this.emptyNoData()}
              {filterStudents.length > 0 && (
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 4 }}
                  dataSource={filterStudents}
                  renderItem={item =>
                    item.monitoringStatus !== 'MS_6' ? (
                      <Dropdown
                        overlay={menu(item.ipAddress, item.connId, item.seatNo, item.userName)}
                        trigger={['contextMenu']}
                      >
                        <List.Item>{this.showItem(item)}</List.Item>
                      </Dropdown>
                    ) : (
                      <List.Item className={styles.notAllow}>{this.showItem(item)}</List.Item>
                    )
                  }
                />
              )}
            </TabPane>
          )}
        </Tabs>
      </div>
    );
  }
}
export default Step2;
