import React, { Component } from 'react';
import { List, Card, Tabs, Menu, Dropdown, message, Tooltip } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import cn from 'classnames';
import ProgressIndex from './Components/Progress/index';
import { proxyTokenDelete } from '@/services/teacher';
import Modal from '@/components/Modal';
import { closeStudent } from '@/utils/instructions';
import studentHead from '@/assets/none_card_icon.png';
import cornerLess from '@/assets/corner_less_icon.png';
import styles from './index.less';

const { TabPane } = Tabs;

@connect(({ task }) => {
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
    filterStudents,
    conditions,
  };
})
class Step4 extends Component {
  componentDidMount() {
    // 将任务状态设置成任务结束状态
    const { dispatch, taskId } = this.props;
    dispatch({
      type: 'task/stopTask',
      payload: taskId,
    });
  }

  /**
   * @description 异常处理
   * @memberof exceptionUser
   */
  exceptionUser = sid => {
    const { dispatch, type } = this.props;

    dispatch({
      type: 'popup/open',
      payload: type === 'TT_2' ? 'practiceExceptionHandle' : 'examExceptionHandle',
      data: sid,
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
  closeStudent = (ip, connId) => {
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
    // sendMS('close',data,connId)
    closeStudent(connId);

    const { dispatch, filterStudents, conditions } = this.props;
    const filterStudent = JSON.parse(JSON.stringify(filterStudents));
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

    // 此时判断是哪个IP对应修改该学生的状态
    // const {students,dispatch} = this.props;
    // const student = JSON.parse(JSON.stringify(students));
    // student.forEach((item,index)=>{
    //     if(item.ipAddress === ip) {
    //       student.splice(index,1)
    //     }
    // })
    // 更新学生列表信息
    // dispatch({
    // type: 'task/updateLinking',
    // payload: {
    //     students: student
    //   }
    // });
  };

  switchStatus = (status, type) => {
    switch (status) {
      case 'ES_1':
        return type === 'TT_2'
          ? formatMessage({ id: 'task.title.examStatusNoPractice', defaultMessage: '未练习' })
          : formatMessage({ id: 'task.title.examStatusNoTest', defaultMessage: '未考' });
      case 'ES_2':
        return type === 'TT_2'
          ? formatMessage({ id: 'task.title.examStatusPracticed', defaultMessage: '已练习' })
          : formatMessage({ id: 'task.text.examStatusTesting', defaultMessage: '正在考试' });
      case 'ES_3':
        return type === 'TT_2'
          ? formatMessage({ id: 'task.title.examStatusPracticed', defaultMessage: '已练习' })
          : formatMessage({ id: 'task.title.examStatusFailure', defaultMessage: '考试失败' });
      case 'ES_4':
        return type === 'TT_2'
          ? formatMessage({ id: 'task.title.examStatusPracticed', defaultMessage: '已练习' })
          : formatMessage({ id: 'task.title.examStatusSucess', defaultMessage: '考试成功' });
      default:
        return 0;
    }
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
  showItem = item => {
    // 如果考试失败则添加卡片的背景色样式
    const { type } = this.props;
    return (
      <Card
        title={item.ipAddress}
        className={item.monitoringStatus === 'MS_10' ? 'studentIpOrange' : ''}
        style={item.examStatus === 'ES_3' ? { background: '#FFE3DD' } : {}}
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
            <span
              className={cn(
                styles.seatNumber,
                `connect${
                  type === 'TT_2' &&
                  item.paperList.length > 0 &&
                  item.paperList.filter(vo => vo.upLoadStatus === 0).length > 0
                    ? 'ES_3'
                    : item.examStatus
                }`
              )}
            >
              {item.seatNo !== '' ? item.seatNo : '--'}
            </span>
            <span className={cn(styles.connect, `connect${item.examStatus}`)}>
              {type !== 'TT_2' &&
                ((item.monitoringStatus === 'MS_13' || item.monitoringStatus === 'MS_10') &&
                item.accessFlag === 'auto' &&
                item.examStatus === 'ES_3'
                  ? ''
                  : this.switchStatus(item.examStatus, type))}
              {type === 'TT_2' &&
                (item.paperList.length > 0 &&
                item.paperList.filter(vo => vo.upLoadStatus === 0).length > 0
                  ? ''
                  : this.switchStatus(item.examStatus, type))}
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
              {item.tipName ? (
                <ProgressIndex
                  data={item.answerProcess}
                  counts={item.totalQuestionNum}
                  tipDecript={item.tipName}
                />
              ) : (
                '--'
              )}
            </div>
          </div>
        </div>
        {type !== 'TT_2' &&
          !item.respondentsStatus &&
          item.respondentsStatus !== 'RS_1' &&
          item.respondentsStatus !== 'RS_5' &&
          item.respondentsStatus !== 'RS_6' &&
          item.examStatus === 'ES_3' && <img src={cornerLess} alt="" />}
        {type === 'TT_2' &&
          (item.paperList.length > 0 &&
          item.paperList.filter(vo => vo.upLoadStatus === 0).length > 0 ? (
            <div>
              <img src={cornerLess} alt="" />
              {/* <span className={styles.failCount}>{item.paperList.filter(vo=>vo.respondentsStatus==='RS_4').length}</span> */}
            </div>
          ) : (
            ''
          ))}
      </Card>
    );
  };

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
   * 是否显示异常处理
   * 处理标志=manual  且 考试状态=考试失败  不允许弹出“异常处理”右键菜单；
   * 当考试状态=考试成功，右键异常处理（置失败）
   * 当考试状态=考试失败 且 处理标志= auto  且 监考状态in(MS_10 MS_13)，右键异常处理（回收答卷/导入）
   */
  showExceptionUser = (examStatus, accessFlag, monitoringStatus, type, paperList) => {
    if (type === 'TT_2') {
      return !paperList.every(item => ['RS_1', 'RS_5', 'RS_6'].includes(item.respondentsStatus));
    }

    if (examStatus === 'ES_4') {
      return true;
    }
    if (examStatus === 'ES_3' && ['MS_10', 'MS_13'].includes(monitoringStatus)) {
      return true;
    }
    return false;
  };

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
    const { dispatch, students, type } = this.props;
    if (key === '1') {
      dispatch({
        type: 'task/filterTaskWathData',
        payload: {
          filterStudent: students,
          conditions: key,
        },
      });
    }
    if (key === '7') {
      dispatch({
        type: 'task/filterTaskWathData',
        payload: {
          filterStudent: students.filter(data => data.examStatus === 'ES_4'),
          conditions: key,
        },
      });
    }
    if (key === '8') {
      dispatch({
        type: 'task/filterTaskWathData',
        payload: {
          filterStudent:
            type === 'TT_2'
              ? students.filter(data => {
                  if (data.paperList.length > 0) {
                    return data.paperList.filter(vo => vo.upLoadStatus === 0).length > 0;
                  }
                  return false;
                })
              : students.filter(data => data.examStatus === 'ES_3'),
          conditions: key,
        },
      });
    }
    if (key === '9') {
      dispatch({
        type: 'task/filterTaskWathData',
        payload: {
          filterStudent: students.filter(
            data => data.examStatus !== 'ES_3' && data.examStatus !== 'ES_4'
          ),
          conditions: key,
        },
      });
    }
  };

  render() {
    const { students, taskStudentRelationVOList, type, filterStudents } = this.props;
    const menu = (sid, connId, ipAddress, userName, seatNo, monitoringStatus) => {
      if (students.length > 0) {
        const { examStatus, accessFlag, paperList = [] } = students.find(
          item => item.studentId === sid
        );
        return (
          <Menu className="oper">
            {// 处理标志=manual  且 考试状态=考试失败  不允许弹出“异常处理”右键菜单；
            // 当考试状态=考试成功，右键异常处理（置失败）
            // 当考试状态=考试失败 且 处理标志= auto  且 监考状态in(MS_10 MS_13)，右键异常处理（回收答卷/导入）
            this.showExceptionUser(examStatus, accessFlag, monitoringStatus, type, paperList) && (
              <Menu.Item key="2" onClick={() => this.exceptionUser(sid, connId)}>
                <i className="iconfont icon-warning" />
                {formatMessage({ id: 'task.button.exceptStudent', defaultMessage: '异常考生处理' })}
              </Menu.Item>
            )}
            <Menu.Item
              key="4"
              onClick={() => this.beforeCloseStudent(ipAddress, connId, userName, seatNo)}
            >
              <i className="iconfont icon-shut_down" />
              {formatMessage({ id: 'task.text.closeStudent', defaultMessage: '关闭学生机' })}
            </Menu.Item>
          </Menu>
        );
      }
      return <Menu className="oper" />;
    };
    const newAdd = taskStudentRelationVOList.filter(
      vo => vo.examFlag && vo.examFlag !== '' && vo.examFlag !== null && vo.status === 'Y'
    );
    return (
      <div className={styles.steps}>
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
              <span className={cn(styles.connecting, styles.statusNow, 'connecting')}>
                {formatMessage({ id: 'task.text.all', defaultMessage: '全部' })} ({students.length})
              </span>
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
                      item.studentId,
                      item.connId,
                      item.ipAddress,
                      item.userName,
                      item.seatNo,
                      item.monitoringStatus
                    )}
                    trigger={['contextMenu']}
                  >
                    <List.Item className={item.monitoringStatus === 'MS_13' ? 'uploadFail' : ''}>
                      {this.showItem(item)}
                    </List.Item>
                  </Dropdown>
                )}
              />
            )}
          </TabPane>
          <TabPane
            tab={
              <span className={cn(styles.connecting, styles.statusNow, 'connecting')}>
                <i />
                {type === 'TT_2'
                  ? formatMessage({ id: 'task.text.praticed', defaultMessage: '已练习' })
                  : formatMessage({ id: 'task.text.testSucess', defaultMessage: '考试成功' })}
                ({students.filter(data => data.examStatus === 'ES_4').length})
              </span>
            }
            key="7"
          >
            {filterStudents.length === 0 && this.emptyNoData()}
            {filterStudents.length > 0 && (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 4 }}
                dataSource={filterStudents}
                renderItem={item =>
                  item.examStatus === 'ES_4' &&
                  item.paperList &&
                  item.paperList.length > 0 &&
                  item.paperList.filter(vo => vo.upLoadStatus !== 0).length > 0 ? (
                    <Dropdown
                      overlay={menu(
                        item.studentId,
                        item.connId,
                        item.ipAddress,
                        item.userName,
                        item.seatNo
                      )}
                      trigger={['contextMenu']}
                    >
                      <List.Item className={item.monitoringStatus === 'MS_13' ? 'uploadFail' : ''}>
                        {this.showItem(item)}
                      </List.Item>
                    </Dropdown>
                  ) : (
                    <List.Item
                      className={
                        item.monitoringStatus === 'MS_13' ? 'uploadFail notAllow' : 'notAllow'
                      }
                    >
                      {this.showItem(item)}
                    </List.Item>
                  )
                }
              />
            )}
          </TabPane>
          <TabPane
            tab={
              <span className={cn(styles.excepted, styles.statusNow, 'excepted')}>
                <i />
                {type === 'TT_2'
                  ? formatMessage({ id: 'task.title.Lackofanswers', defaultMessage: '答卷缺失' })
                  : formatMessage({ id: 'task.text.testFailure', defaultMessage: '考试失败' })}{' '}
                (
                {type === 'TT_2'
                  ? students.filter(data => {
                      if (data.paperList.length > 0) {
                        return data.paperList.filter(vo => vo.upLoadStatus === 0).length > 0;
                      }
                      return false;
                    }).length
                  : students.filter(data => data.examStatus === 'ES_3').length}
                )
              </span>
            }
            key="8"
          >
            {filterStudents.length === 0 && this.emptyNoData()}
            {filterStudents.length > 0 && (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 4 }}
                dataSource={filterStudents}
                renderItem={item =>
                  (type === 'TT_2' &&
                    item.paperList &&
                    item.paperList.length > 0 &&
                    item.paperList.filter(vo => vo.upLoadStatus === 0).length > 0) ||
                  (type !== 'TT_2' &&
                    item.examStatus === 'ES_3' &&
                    item.monitoringStatus !== 'MS_13') ? (
                    // eslint-disable-next-line react/jsx-indent
                    <Dropdown
                      overlay={menu(
                        item.studentId,
                        item.connId,
                        item.ipAddress,
                        item.userName,
                        item.seatNo
                      )}
                      trigger={['contextMenu']}
                    >
                      <List.Item className={item.monitoringStatus === 'MS_13' ? 'uploadFail' : ''}>
                        {this.showItem(item)}
                      </List.Item>
                    </Dropdown>
                  ) : (
                    <List.Item
                      className={
                        item.monitoringStatus === 'MS_13' ? 'uploadFail notAllow' : 'notAllow'
                      }
                    >
                      {this.showItem(item)}
                    </List.Item>
                  )
                }
              />
            )}
          </TabPane>
          {type !== 'TT_2' && (
            <TabPane
              tab={
                <span className={cn(styles.excepted, styles.statusNow, 'excepted')}>
                  <i />
                  {formatMessage({ id: 'task.title.other', defaultMessage: '其他' })} (
                  {
                    students.filter(
                      data => data.examStatus !== 'ES_3' && data.examStatus !== 'ES_4'
                    ).length
                  }
                  )
                </span>
              }
              key="9"
            >
              {filterStudents.length === 0 && this.emptyNoData()}
              {filterStudents.length > 0 && (
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 4 }}
                  dataSource={filterStudents}
                  renderItem={item =>
                    item.examStatus !== 'ES_3' && item.examStatus !== 'ES_4' ? (
                      <Dropdown
                        overlay={menu(
                          item.studentId,
                          item.connId,
                          item.ipAddress,
                          item.userName,
                          item.seatNo
                        )}
                        trigger={['contextMenu']}
                      >
                        <List.Item>{this.showItem(item)}</List.Item>
                      </Dropdown>
                    ) : (
                      <List.Item>{this.showItem(item)}</List.Item>
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
export default Step4;
