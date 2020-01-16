import React, { PureComponent } from 'react';
import { Card, Icon, Tabs, Table, Divider, Select, Input, Button, Spin, Tooltip } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import cs from 'classnames';
import {
  studentExerciseStatusLib, // 学生练习任务状态字典库
  studentExamsStatusLib, // 学生考试任务状态字典库
} from '@/utils/dictionary';
import ShowPaperList from './ShowPaperList';
import Modal from '@/components/Modal';
import styles from './index.less';
import noneCardIcon from '@/assets/none_card_icon.png';

const { TabPane } = Tabs;
const { Option } = Select;
const { Search } = Input;

// 显示空对象
const getEmptyRender = (img, text) => (
  <div className={styles.empty}>
    <img className={styles['empty-img']} src={img} alt={text} />
    <div className={styles['empty-text']}>{text}</div>
  </div>
);

// 对数据进行预处理
@connect(({ task, vbClient, dictionary }) => {
  const { EXAMFAILRESON = [] } = dictionary;
  const { students, taskInfo } = task;
  const { taskPaperIdList, taskStudentRelationVOList, classList, type } = taskInfo;
  // 根据 studentList 和 students 生成任务详情
  const studentArr = taskStudentRelationVOList.map(item => {
    const student = students.find(obj => obj.studentId === item.studentId) || {};
    // 判断该学生是否已经连接教师机
    const inTask = !!student.studentId;
    // 考生的状态（对应字典表：练习 studentExerciseStatus, 考试 studentExamsStatus）
    const taskStatus = (inTask ? student.examStatus : item.examStatus) || 'ES_1';
    // 是否参加了任务
    const taskAble = item.status === 'Y';

    // 获取答案包的状态
    let respondentsStatus;
    if (inTask) {
      ({ respondentsStatus } = student);
    } else if (item.respondentsList && item.respondentsList.length > 0) {
      ({ respondentsStatus } = item.respondentsList[0] || {});
    }

    return {
      classId: item.classId, // 教室id
      className: item.className, // 教室名称
      classIndex: item.classIndex,
      gender: item.gender || '男', // 性别（未提供）
      examNo: item.examNo, // 考试号
      loading: item.loading, // loading状态
      taskAble, // 是否参加了任务
      inTask, // 是否在测试中
      taskStatus: taskAble ? taskStatus : '', // 学生的状态（对应字典表：练习 studentExerciseStatus, 考试 studentExamsStatus）只有参考才有考试状态
      studentId: item.studentId, // 学生的id
      studentName: item.studentName, // 学生的名称
      seatNo: inTask ? student.seatNo : item.seatNo, // 座位号( 用此判断该学生是否在任务进行中 )
      ipAddress: inTask ? student.ipAddress : item.ipAddress, // 学生ip
      monitoringDesc: inTask ? student.monitoringDesc : item.monitoringDesc, // 考试状态异常的原因，老师输入内容（ 考试专用 ）
      paperArr: (inTask ? student.paperList : item.respondentsList) || [], // 练习试卷数量（练习专用)
      respondentsStatus, // 答题包状态（对应字典表：respondentStatus）
    };
  });

  // 数据默认按升序排序
  studentArr.sort((a, b) => a.examNo - b.examNo);

  // 暴露给proxy的数据
  return {
    examFailReson: EXAMFAILRESON, // 错误原因字体库
    paperList: JSON.stringify(taskPaperIdList || []), // 试卷列表
    studentList: JSON.stringify(studentArr || []), // 学生列表
    classList: JSON.stringify(classList || []), // 教师的列表
    taskType: type === 'TT_2' ? 'practice' : 'exam', // 任务类型（practice：练习；exam：考试）
    sizeType: vbClient.sizeType, // VBclient 的弹框大小   minimized 最小化  maximized 最大化  normal 正常模式
  };
})
class TaskDetail extends PureComponent {
  // 初始化state
  state = {
    tabType: '', // 学生的任务状态
    filterClassId: '', // 根据班级的id过滤学生
    searchKey: '', // 搜索关键字
    sorter: {
      // 监听table，获取排序的规则
      columnKey: '',
      order: '',
    },
    showTable: false, // 页面不是一开始就显示table，等弹框出现或，在显示table
    current: 1, // table的当前页
  };

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        showTable: true,
      });
    }, 500);
  }

  // 切换标签页
  changeTab = key => {
    this.setState({
      tabType: key,
      current: 1,
    });
  };

  // 选择班级
  handleChange = key => {
    this.setState({
      filterClassId: key,
      current: 1,
    });
  };

  // 按学生姓名或学号搜索
  searchKey = key => {
    this.setState({
      searchKey: key,
      current: 1,
    });
  };

  /**
   * 参加考试
   * 逻辑处理：
   * 1: 将proxy上用户设置为参加考试，并且状态设置为未考
   * 2：判断当期的监考数据中，是否有该数据，则设置为无效数据
   */
  joinTask = async sid => {
    const { dispatch } = this.props;
    // 设置考生状态为未考状态
    await dispatch({
      type: 'task/updateStudentTaskStatus',
      payload: sid,
    });
  };

  /**
   * 重新考试（同上）
   */
  reJoinTask = async sid => {
    const { dispatch } = this.props;
    // 设置考试状态未未考状态
    await dispatch({
      type: 'task/updateStudentTaskStatus',
      payload: sid,
    });
  };

  /**
   * 弹框 显示已练习试卷数
   */
  showPaperList = paperList => {
    if (!paperList || paperList.length === 0) {
      return;
    }
    Modal.info({
      icon: null,
      width: 600,
      className: styles['show-paper-list'],
      centered: true,
      maskClosable: true,
      title: formatMessage({
        id: 'task.title.practice.paper.number',
        defaultMessage: '练习试卷数量',
      }),
      content: <ShowPaperList list={paperList} />,
      okButtonProps: { style: { display: 'none' } },
    });
  };

  /**
   * 重新考试，重新练习，二次确认
   */
  confirmFn = (studentId, studentName, type, tag) => {
    const content = (
      <div>
        是否安排 <span className={styles['main-color']}>{studentName}</span> {tag}
      </div>
    );
    Modal.confirm({
      title: null,
      width: 360,
      content,
      icon: null,
      okText: formatMessage({ id: 'task.button.yes', defaultMessage: '是' }),
      cancelText: formatMessage({ id: 'task.button.no', defaultMessage: '否' }),
      okButtonProps: {
        type: 'main',
        shape: 'round',
      },
      cancelButtonProps: {
        shape: 'round',
      },
      onOk: async () => {
        if (type === 'inJoin') {
          // 参考参练
          await this.joinTask(studentId);
        } else {
          // 重考重连
          await this.reJoinTask(studentId);
        }
      },
    });
  };

  // 根据条件进行排序
  onTableChange = (_, __, sort = {}) => {
    const { sorter } = this.state;
    const { columnKey, order } = sort;
    if (sorter.columnKey !== columnKey || sorter.order !== order) {
      this.setState({
        sorter: { columnKey, order },
      });
    }
  };

  // 对数据进行排序
  sortStudent = students => {
    const { sorter } = this.state;
    const { columnKey, order } = sorter;
    if (columnKey && order) {
      students.sort((a, b) => {
        let val = 0;
        if (columnKey === 'columnKey') {
          // 考号排序
          if (a.examNo.length > 17 || b.examNo.length > 17) {
            const pre = a.examNo.toString().substring(0, 16);
            const next = b.examNo.toString().substring(0, 16);
            const preTo = a.examNo.toString().substring(16, 20);
            const nextTo = b.examNo.toString().substring(16, 20);
            if (Number(pre) > Number(next)) {
              val = 1;
            } else if (Number(pre) === Number(next)) {
              val = Number(preTo) - Number(nextTo);
            }
          } else {
            val = Number(a.examNo) - Number(b.examNo);
          }
        } else if (columnKey === 'classIndex') {
          // 班级排序
          const aVal = a.classIndex ? a.classIndex : a.className;
          const bVal = b.classIndex ? b.classIndex : b.className;
          val = (aVal || '').localeCompare(bVal || '');
        } else if (columnKey === 'respondentsStatus') {
          // 答卷包状态，其中有一个特殊情况， 考试失败，但是答卷状态没有，则答卷状态默认为RS_2
          let aVal;
          if (a.respondentsStatus) {
            aVal = a.respondentsStatus;
          } else if (a.taskStatus === 'ES_3') {
            aVal = 'RS_2';
          } else {
            aVal = null;
          }

          let bVal;
          if (b.respondentsStatus) {
            bVal = b.respondentsStatus;
          } else if (b.taskStatus === 'ES_3') {
            bVal = 'RS_2';
          } else {
            bVal = null;
          }

          val = (aVal || '').localeCompare(bVal || '');
        } else if (columnKey === 'seatNo') {
          // 由于后台返回的座位是字符串格式，故需要强制比较数字
          val = parseInt(a[columnKey] || -1, 10) - parseInt(b[columnKey] || -1, 10);
        } else {
          val = String(a[columnKey] || '').localeCompare(String(b[columnKey] || ''));
        }

        // 升序
        if (order === 'ascend') {
          return val;
        }

        // 如果是降序
        if (order === 'descend') {
          return val * -1;
        }

        // 不排序
        return 0;
      });
    }
    return students;
  };

  /**
   * 切换页面
   */
  changePage = page => {
    this.setState({ current: page });
  };

  /**
   * render
   */
  render() {
    const { tabType, filterClassId, searchKey, showTable, current } = this.state;
    const {
      paperList: paperListStr,
      studentList: studentListstr,
      classList: classListStr,
      taskType,
      onClose,
      sizeType,
      examFailReson,
    } = this.props;

    const paperList = JSON.parse(paperListStr);
    const studentList = JSON.parse(studentListstr);
    const classList = JSON.parse(classListStr);

    // 判断当前任务是练习还是考试，并提供可配项( 默认考试 )
    let config = {
      taskStatus: studentExamsStatusLib, // 考试状态字典
      title: formatMessage({ id: 'task.text.testExam', defaultMessage: '考试' }),
      unTask: formatMessage({ id: 'task.text.NoReference', defaultMessage: '不参考' }),
      shouldTask: formatMessage({ id: 'task.text.testPeople', defaultMessage: '应考人数' }),
      actualTask: formatMessage({ id: 'task.text.actual.exam.number', defaultMessage: '实考人数' }),
    };
    if (taskType === 'practice') {
      // 练习的配置项
      config = {
        taskStatus: studentExerciseStatusLib,
        title: formatMessage({ id: 'task.text.Practicing', defaultMessage: '练习' }),
        unTask: formatMessage({ id: 'task.text.NotPracticing', defaultMessage: '不参练' }),
        shouldTask: formatMessage({ id: 'task.text.praticeStudent', defaultMessage: '应练学生' }),
        actualTask: formatMessage({ id: 'task.text.praticed', defaultMessage: '已练习' }),
      };
    }

    const students = studentList.filter(item => {
      let isShow = true;
      // 根据班级的选择情况过滤数据
      if (filterClassId !== '' && filterClassId !== item.classId) {
        isShow = false;
      }
      //
      const searchKeyTrim = searchKey.trim();

      // 按学生姓名或学号搜索
      if (searchKeyTrim !== '') {
        const { studentName, examNo } = item;
        let tag = false;
        if (studentName && studentName.indexOf(searchKeyTrim) !== -1) {
          tag = true;
        } else if (examNo && examNo.indexOf(searchKeyTrim) !== -1) {
          tag = true;
        }
        if (!tag) {
          isShow = false;
        }
      }
      return isShow;
    });

    // 过滤要显示的学生数组信息
    let studentArr = students.filter(item => {
      // 全部显示
      if (!tabType) {
        return true;
      }

      const list = tabType.split('、');

      // 显示不参考
      if (list.includes('noJoin') && item.taskAble !== true) {
        return true;
      }

      // 其它类型
      if (list.includes(item.taskStatus)) {
        return true;
      }

      return false;
    });

    // 获取 当前条件下，所有条件的选项 table 总列表的长度
    this.showAllCount = studentArr.length;
    studentArr = this.sortStudent(studentArr);

    // tab标签数组
    let listTab = [
      {
        key: '',
        title: formatMessage({ id: 'task.text.all', defaultMessage: '全部' }),
        count: students.length,
      },
      {
        key: 'ES_2',
        title: formatMessage({ id: 'task.text.tasking', defaultMessage: '正在进行' }),
        count: students.filter(item => item.taskStatus === 'ES_2').length,
      },
      {
        key: 'ES_4',
        title: formatMessage({ id: 'task.title.examStatusSucess', defaultMessage: '考试成功' }),
        count: students.filter(item => item.taskStatus === 'ES_4').length,
      },
      {
        key: 'ES_3',
        title: formatMessage({ id: 'task.title.examStatusFailure', defaultMessage: '考试失败' }),
        count: students.filter(item => item.taskStatus === 'ES_3').length,
      },
      {
        key: 'ES_1',
        title: formatMessage({ id: 'task.text.unexam', defaultMessage: '未考试' }),
        count: students.filter(item => item.taskStatus === 'ES_1').length,
      },
      {
        key: 'noJoin',
        title: formatMessage({ id: 'task.text.NoReference', defaultMessage: '不参考' }),
        count: students.filter(item => !item.taskAble).length,
      },
    ];

    // 练习模式的进行数据调整
    if (taskType === 'practice') {
      listTab = [
        {
          key: '',
          title: formatMessage({ id: 'task.text.all', defaultMessage: '全部' }),
          count: students.length,
        },
        {
          key: 'ES_2',
          title: formatMessage({ id: 'task.text.tasking', defaultMessage: '正在进行' }),
          count: students.filter(item => item.taskStatus === 'ES_2').length,
        },
        {
          key: 'ES_4、ES_3',
          title: formatMessage({ id: 'task.title.examStatusPracticed', defaultMessage: '已练习' }),
          count: students.filter(item => item.taskStatus === 'ES_4' || item.taskStatus === 'ES_3')
            .length,
        },
        {
          key: 'ES_1、noJoin',
          title: formatMessage({ id: 'task.title.examStatusNoPractice', defaultMessage: '未练习' }),
          count: students.filter(
            item =>
              item.taskStatus !== 'ES_2' && item.taskStatus !== 'ES_3' && item.taskStatus !== 'ES_4'
          ).length,
        },
      ];
    }

    // table标签数组
    const columns = [
      {
        title: formatMessage({ id: 'task.title.sutdent.code', defaultMessage: '考号' }),
        dataIndex: 'examNo',
        width: 180,
        sorter: true,
        render: examNo => <span>{examNo}</span>,
      },
      {
        title: formatMessage({ id: 'task.title.name', defaultMessage: '姓名' }),
        dataIndex: 'studentName',
        sorter: true,
        width: 120,
        render: studentName => (
          <Tooltip title={studentName}>
            <span className={styles['class-name']}>{studentName}</span>
          </Tooltip>
        ),
      },
      // {
      //   title: formatMessage({ id: 'task.title.gender', defaultMessage: '性别' }),
      //   dataIndex: 'gender',
      //   width: 80,
      //   render: gender => (
      //     <span>
      //       {{
      //         MALE: formatMessage({ id: 'task.text.male', defaultMessage: '男' }),
      //         FEMALE: formatMessage({ id: 'task.text.female', defaultMessage: '女' }),
      //       }[gender] || ''}
      //     </span>
      //   ),
      // },
      {
        title: formatMessage({ id: 'task.title.classes', defaultMessage: '班级' }),
        width: 120,
        sorter: true,
        dataIndex: 'classIndex',
        render: (_, record) => (
          <Tooltip title={record.className}>
            <span className={styles['class-name']}>{record.className}</span>
          </Tooltip>
        ),
      },
      {
        title: formatMessage({ id: 'task.text.SeatNumber', defaultMessage: '座位号' }),
        dataIndex: 'seatNo',
        sorter: (a, b) => Number(a.seatNo) - Number(b.seatNo),
        width: 100,
      },
      {
        title: formatMessage({ id: 'task.text.IPAddress', defaultMessage: 'IP地址' }),
        dataIndex: 'ipAddress',
        width: 120,
      },
      {
        title: `${config.title}${formatMessage({ id: 'task.text.state', defaultMessage: '状态' })}`,
        dataIndex: 'taskStatus',
        width: 120,
        render: (_, record) => {
          const { taskStatus, taskAble } = record;

          // 考试的显示内容
          if (taskType === 'exam') {
            // 判断是否参加考试，或练习
            if (!taskAble) return <span>{config.unTask}</span>;
            // 任务进行中
            if (taskStatus === 'ES_2') {
              return (
                <span style={{ color: 'rgba(3, 196, 107, 1)' }}>
                  {config.taskStatus[taskStatus]}
                </span>
              );
            }
            // 任务失败
            if (taskStatus === 'ES_3') {
              return (
                <span style={{ color: 'rgba(255, 110, 74, 1)' }}>
                  {config.taskStatus[taskStatus]}
                </span>
              );
            }
            return <span>{config.taskStatus[taskStatus]}</span>;
          }

          // 练习的显示内容
          // 任务进行中
          if (taskStatus === 'ES_2') {
            return (
              <span style={{ color: 'rgba(3, 196, 107, 1)' }}>{config.taskStatus[taskStatus]}</span>
            );
          }

          // 任务失败或成功  都是  已练习
          if (taskStatus === 'ES_3' || taskStatus === 'ES_4') {
            return (
              <span>{formatMessage({ id: 'task.text.praticed', defaultMessage: '已练习' })}</span>
            );
          }

          // 其它的都是未练习
          return (
            <span>
              {formatMessage({ id: 'task.title.examStatusNoPractice', defaultMessage: '未练习' })}
            </span>
          );
        },
      },
      {
        title: formatMessage({ id: 'task.text.reason', defaultMessage: '原因' }),
        dataIndex: 'monitoringDesc',
        width: 200,
        render: val => {
          const { value } = examFailReson.find(item => item.code === val) || {};
          return value || '';
        },
      },
      {
        title: formatMessage({
          id: 'task.title.has,practice.paper.number',
          defaultMessage: '已练习试卷数',
        }),
        dataIndex: 'paperList',
        width: 100,
        render: (_, record) => {
          const { paperArr } = record;
          return (
            <Button type="link" onClick={() => this.showPaperList(paperArr)}>
              {paperArr.length}
            </Button>
          );
        },
      },
      // {
      //   title: '有效答卷数',
      //   dataIndex: 'paperListCount',
      //   width :100,
      //   render    : ( _,record ) => {
      //     const { paperArr } = record;
      //     const list = paperArr.filter(item=>item.respondentsStatus==="RS_1");
      //     return list.length;
      //   }
      // },
      {
        title: formatMessage({ id: 'task.title.answer.status', defaultMessage: '答卷状态' }),
        width: 100,
        dataIndex: 'respondentsStatus',
        render: (_, record) => {
          const { taskStatus, respondentsStatus } = record;
          if (respondentsStatus === 'RS_1') {
            return <span>正常</span>;
          }

          if (
            respondentsStatus === 'RS_2' ||
            respondentsStatus === 'RS_3' ||
            respondentsStatus === 'RS_4'
          ) {
            return (
              <span style={{ color: 'rgba(255, 110, 74, 1)' }}>
                {formatMessage({ id: 'task.text.no.answer', defaultMessage: '无答卷' })}
              </span>
            );
          }

          if (respondentsStatus === 'RS_5') {
            return (
              <span style={{ color: 'rgba(255, 110, 74, 1)' }}>
                {formatMessage({ id: 'task.text.answer.incomplete', defaultMessage: '答卷不完整' })}
              </span>
            );
          }
          if (respondentsStatus === 'RS_6') {
            return (
              <span style={{ color: 'rgba(255, 110, 74, 1)' }}>
                {formatMessage({ id: 'task.title.abnormal', defaultMessage: '异常' })}
              </span>
            );
          }
          return taskStatus === 'ES_3' ? (
            <span style={{ color: 'rgba(255, 110, 74, 1)' }}>
              {formatMessage({ id: 'task.text.no.answer', defaultMessage: '无答卷' })}
            </span>
          ) : null;
        },
      },
      {
        title: formatMessage({ id: 'task.title.options', defaultMessage: '操作' }),
        dataIndex: 'options',
        align: 'center',
        width: 120,
        render: (_, record) => {
          const { taskAble, taskStatus, studentId, loading = false, studentName } = record;
          let content = null;
          if (!taskAble) {
            // 如果是不参加的学生--则：显示 参加考试
            const joinText =
              taskType === 'exam'
                ? formatMessage({ id: 'task.message.join.exam', defaultMessage: '参加考试' })
                : formatMessage({ id: 'task.message.join.practice', defaultMessage: '参加练习' });
            content = (
              <a onClick={() => this.confirmFn(studentId, studentName, 'inJoin', joinText)}>
                {joinText}
              </a>
            );
          } else if (
            (['ES_3', 'ES_4'].includes(taskStatus) && taskType === 'exam') ||
            (['ES_3', 'ES_4'].includes(taskStatus) && taskType === 'practice')
          ) {
            // 只有考试失败的学生才能重新考试或重新练习
            // 修改变更： 考试成功、失败的都能参加 重新考试或练习
            const reText =
              taskType === 'exam'
                ? formatMessage({ id: 'task.message.re.exam', defaultMessage: '重新考试' })
                : formatMessage({ id: 'task.message.re.practice', defaultMessage: '重新练习' });
            content = (
              <a onClick={() => this.confirmFn(studentId, studentName, 'reJoin', reText)}>
                {reText}
              </a>
            );
          } else {
            // 无操作
            content = null;
          }

          return (
            <Spin spinning={loading}>
              <div className={styles.options}>{content}</div>
            </Spin>
          );
        },
      },
    ].filter(item => {
      // 如果是考试，过滤掉原因
      if (
        taskType === 'exam' &&
        (item.dataIndex === 'paperList' || item.dataIndex === 'paperListCount')
      ) {
        return false;
      }
      // 如果是练习，过滤掉异常原因和答题包状态
      if (
        taskType === 'practice' &&
        (item.dataIndex === 'monitoringDesc' || item.dataIndex === 'respondentsStatus')
      ) {
        return false;
      }
      return true;
    });

    let scroll = false;
    if (studentArr.length === 0) {
      scroll = undefined;
    } else if (sizeType === 'maximized') {
      scroll = { y: 'calc( 100vh - 380px )' };
    } else if (studentArr.length < 10) {
      scroll = { x: 'max-content' };
    } else {
      scroll = { x: 'max-content', y: 'calc( 100vh - 380px )' };
    }

    return (
      <Card
        title={`${config.title}${formatMessage({
          id: 'task.text.infomationTotal',
          defaultMessage: '情况统计',
        })}`}
        extra={<Icon type="close" className={styles.pointer} onClick={onClose} />}
        bodyStyle={{ padding: '0px', height: 'calc(100% - 56px)' }}
        className={styles.contect}
      >
        {/* 调整点2：考场情况统计中的应考人数的规则的调整：
        在监考页面，通过调用PROXY-107接口，获取任务详情数据，考场情况统计中统计实考人数规则：  taskStudentRelationVOList.examStatus=‘ES_4’
        且 taskStudentRelationVOList.status=‘Y’      的学生数 */}

        {/* 统计功能 */}
        <div className={styles['count-list']}>
          <div>班级数量：{classList.length}</div>
          <Divider className={styles.divider} type="vertical" />
          <div>试卷数量：{paperList.length}</div>
          <Divider className={styles.divider} type="vertical" />
          <div>总人数：{studentList.length}</div>
          <Divider className={styles.divider} type="vertical" />
          <div>
            {config.shouldTask}：{studentList.filter(item => item.taskAble).length}
          </div>
          <Divider className={styles.divider} type="vertical" />
          <div>
            {config.actualTask}：
            {
              studentList.filter(
                item => item.taskAble && (item.taskStatus === 'ES_4' || item.taskStatus === 'ES_3')
              ).length
            }
          </div>
        </div>

        {/* 检索及列表功能 */}
        <div className={styles['content-list']}>
          {/* 按班级检索 */}
          <div className={styles['filter-list']}>
            <div className={styles['filter-select']}>
              <span>{formatMessage({ id: 'task.title.class', defaultMessage: '班级：' })}</span>
              <Select defaultValue="" style={{ minWidth: 150 }} onChange={this.handleChange}>
                <Option value="" key="1">
                  {formatMessage({ id: 'task.text.all', defaultMessage: '全部' })}
                </Option>
                {classList.map(item => (
                  <Option value={item.classId} key={item.classId}>
                    {item.className}
                  </Option>
                ))}
              </Select>
            </div>
            {/* 按学生姓名或学号搜索 */}
            <div className={styles['filter-search']}>
              <Search
                placeholder={formatMessage({
                  id: 'task.placeholder.search.by.student.name.or.examNo',
                  defaultMessage: '按学生姓名或考号搜索',
                })}
                onSearch={this.searchKey}
                maxLength={30}
                enterButton
              />
            </div>
          </div>

          {/* 任务状态标签检索 */}
          <Tabs
            defaultActiveKey=""
            className={styles.tabs}
            type="card"
            onChange={this.changeTab}
            tabBarGutter={6}
            tabBarStyle={{ margin: '0px', borderBottom: 'none' }}
          >
            {listTab.map(item => (
              <TabPane
                className={cs(styles.tabPane)}
                tab={`${item.title}(${item.count})`}
                key={item.key}
              />
            ))}
          </Tabs>

          {/* 学生检索结果 */}
          <Table
            rowKey="studentId"
            className={cs(styles.table)}
            columns={columns}
            scroll={showTable ? scroll : []}
            loading={!showTable}
            dataSource={showTable ? studentArr : []}
            locale={{
              emptyText: getEmptyRender(
                noneCardIcon,
                formatMessage({ id: 'task.text.noData', defaultMessage: '暂无数据' })
              ),
            }}
            pagination={{
              pageSize: 60,
              hideOnSinglePage: true,
              current,
              onChange: this.changePage,
            }}
            size="small"
            onChange={this.onTableChange}
          />
        </div>
      </Card>
    );
  }
}
export default TaskDetail;
