/* eslint-disable react/button-has-type */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable no-const-assign */
/* eslint-disable prefer-destructuring */
import React, { PureComponent } from 'react';
import { findDOMNode } from 'react-dom';
import {
  Card,
  Icon,
  Tabs,
  Table,
  Divider,
  Select,
  Input,
  Button,
  Spin,
  Tooltip,
  Radio,
} from 'antd';
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
  const { EXAMFAILRESON = [], STUDENTEXAMSTATUS = [] } = dictionary;
  const { students, taskInfo, examPlaceInfo } = task;
  const { taskPaperIdList, taskStudentRelationVOList, classList, type, ueInfo, status } = taskInfo;
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
      taskId: item.taskId,
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
      processResult: item.processResult,
      examFlag: item.examFlag,
      makeUpCount: item.makeUpCount,
      respondentsList: item.respondentsList,
      snapshotId: student.snapshotId,
    };
  });

  // 数据默认按升序排序
  studentArr.sort((a, b) => (String(a.examNo) || '').localeCompare(String(b.examNo) || ''));

  // 暴露给proxy的数据
  return {
    ueInfo,
    examPlaceInfo,
    STUDENTEXAMSTATUS,
    status, // 当前任务状态
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
    examPlaceValue: '-1', // 场次选择
    examPlaceVisible: false,
    choosePlaceVisible: false,
    jsx: <div />,
    infoVisible: false,
    warntext: '',
    current: 1,
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
  reJoinTask = async taskId => {
    const { dispatch, ueInfo } = this.props;

    // 设置考试状态未未考状态
    await dispatch({
      type: 'task/getSubDistrict',
      payload: {
        taskId: ueInfo.ueCampusTaskId,
        type: 'TT_6',
        subTaskId: taskId,
        examPlaceCampusId: ueInfo.examPlaceCampusId,
      },
    });

    this.setState({ examPlaceVisible: true });
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
  confirmFn = (studentId, studentName, type, taskId, record) => {
    this.state.record = record;
    this.state.currentSubTask = {};
    this.state.examPlaceValue = '-1';
    const content = (
      <div>
        {formatMessage({ id: 'task.text.confirm', defaultMessage: '确定为' })}{' '}
        <span className={styles['main-color']}>{`${studentName} ${record.examNo}`}</span>{' '}
        {formatMessage({ id: 'task.text.apcxks', defaultMessage: '安排重新考试？' })}
      </div>
    );

    Modal.confirm({
      title: null,
      width: 360,
      content,
      icon: null,
      centered: true,
      okText: formatMessage({ id: 'task.text.ap', defaultMessage: '安排' }),
      cancelText: formatMessage({ id: 'task.button.cancel', defaultMessage: '取消' }),
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
          await this.reJoinTask(taskId);
        }
      },
    });
  };

  timestampToTime = timestamp => {
    const date = new Date(timestamp); // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
    const Y = `${date.getFullYear()}-`;
    const M = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-`;
    const D = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    //  const h = date.getHours() < 10 ? `0${date.getHours() }:` : `${date.getHours() }:`;
    //  const m = date.getMinutes() < 10 ? `0${date.getMinutes() }:` : `${date.getMinutes() }:`;
    //  const s = date.getSeconds()< 10 ? `0${date.getSeconds()}` : date.getSeconds();
    return Y + M + D;
  };

  handleExamPlace = () => {
    this.state.warntext = '';
    if (this.state.examPlaceValue == '-1') {
      this.setState({
        warntext: formatMessage({
          id: 'task.text.chooseexamroompi',
          defaultMessage: '请选择批次/考场',
        }),
      });
      return;
    }
    if (this.state.record) {
      this.setState({ examPlaceVisible: false });
      if (this.state.examPlaceValue == '1') {
        this.state.ueInfo = this.props.examPlaceInfo.currentSubTask.ueInfo;
        this.state.currentSubTask = this.props.examPlaceInfo.currentSubTask;
        this.confirmExamInfo();
      } else if (this.state.examPlaceValue == '2') {
        this.setState({ choosePlaceVisible: true });
      }
    }
  };

  /**
   *确认重考信息
   */
  confirmExamInfo = () => {
    this.state.warntext = '';
    if (this.state.currentSubTask && this.state.currentSubTask.taskId) {
      this.setState({
        choosePlaceVisible: false,
        examPlaceVisible: false,
      });
      const { examBatchTime, examDate, examBatch, examRoom } = this.state.ueInfo;
      const { studentName, studentId, examNo } = this.state.record;

      const Dates = this.timestampToTime(examDate);
      const examDates = `${Dates}`.split('-');

      Modal.confirm({
        title: null,
        width: 460,
        className: styles.confirm,
        content: (
          <div>
            <button
              aria-label="Close"
              className="ant-modal-close"
              style={{ display: 'block' }}
              onClick={() => {
                Modal.destroyAll();
              }}
            >
              <span className="ant-modal-close-x">
                <i aria-label="icon: close" className="anticon anticon-close ant-modal-close-icon">
                  <svg
                    viewBox="64 64 896 896"
                    className=""
                    data-icon="close"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z" />
                  </svg>
                </i>
              </span>
            </button>
            <div className={styles.confirmTip}>
              {formatMessage({ id: 'task.text.qrckxx', defaultMessage: '确认重考信息' })}
            </div>

            <div className={cs(styles.card, styles.first, styles.gerybackground)}>
              <div className={styles.label}>
                {formatMessage({ id: 'task.text.ksname', defaultMessage: '考生姓名' })}：
              </div>
              <div className={styles.info}>{studentName}</div>
            </div>
            <div className={cs(styles.card, styles.first, styles.gerybackground)}>
              <div className={styles.label}>
                {formatMessage({ id: 'task.title.sutdent.code', defaultMessage: '考号' })}：
              </div>
              <div className={styles.info}>{examNo}</div>
            </div>
            <div className={cs(styles.card, styles.gerybackground)}>
              <div className={styles.label}>
                {formatMessage({ id: 'task.text.ccap', defaultMessage: '批次安排' })}：
              </div>
              <div className={styles.info}>
                {`${examDates[1] +
                  formatMessage({ id: 'task.text.month', defaultMessage: '月' }) +
                  examDates[2] +
                  formatMessage({
                    id: 'task.text.date',
                    defaultMessage: '日',
                  })} ${examBatchTime} ${examBatch},${examRoom}`}
              </div>
            </div>
          </div>
        ),
        icon: null,
        centered: true,
        okText: formatMessage({ id: 'task.button.confirmBtn', defaultMessage: '确认' }),
        cancelText: formatMessage({ id: 'task.text.prestep', defaultMessage: '上一步' }),
        okButtonProps: {
          type: 'main',
          shape: 'round',
        },
        cancelButtonProps: {
          shape: 'round',
        },
        onOk: async () => {
          this.submitReExamInfo();
        },
        onCancel: () => {
          this.setState({ examPlaceVisible: true });
        },
      });
    } else {
      this.setState({
        warntext: formatMessage({
          id: 'task.text.chooseexamroompi',
          defaultMessage: '请选择批次/考场',
        }),
      });
    }
  };

  /**
   * 提交完重考信息的反馈
   */
  submitReExamInfo = async () => {
    const {
      studentName,
      studentId,
      taskId,
      classId,
      examNo,
      respondentsList,
      snapshotId,
      makeUpCount,
    } = this.state.record;
    const { examBatchTime, examDate, examBatch, examRoom } = this.state.ueInfo;
    const { dispatch, ueInfo } = this.props;
    // 设置考试状态未未考状态
    const res = await dispatch({
      type: 'task/getRepeatTestData',
      payload: {
        studentInfo: {
          classId,
          examNo,
          studentId,
          subTaskId: taskId,
          taskId: ueInfo.ueTaskId,
          snapshotId:
            (respondentsList && respondentsList[0] && respondentsList[0].snapshotId) ||
            snapshotId ||
            '',
          makeUpCount: makeUpCount || 0,
        },
        taskId: ueInfo.ueCampusTaskId,
        type: 'TT_6',
        subTaskId: this.state.currentSubTask.taskId,
        subTaskName: this.state.currentSubTask.name,
        examPlaceValue: this.state.examPlaceValue,
      },
    });

    let jsx = null;

    const Dates = this.timestampToTime(examDate);
    const examDates = `${Dates}`.split('-');

    if (res.data == 'SUCCESS') {
      jsx = (
        <div>
          <div className={styles.success}>
            <i className="iconfont icon-success" />
            <div className={styles.confirmTip}>
              {formatMessage({
                id: 'task.text.resetexamsuccess',
                defaultMessage: '重新考试设置成功',
              })}
            </div>
          </div>

          <div className={cs(styles.card, styles.first, styles.gerybackground)}>
            <div className={styles.label}>
              {formatMessage({ id: 'task.text.ksname', defaultMessage: '考生姓名' })}：
            </div>
            <div className={styles.info}>{studentName}</div>
          </div>
          <div className={cs(styles.card, styles.first, styles.gerybackground)}>
            <div className={styles.label}>
              {formatMessage({ id: 'task.title.sutdent.code', defaultMessage: '考号' })}：
            </div>
            <div className={styles.info}>{examNo}</div>
          </div>
          <div className={cs(styles.card, styles.gerybackground)}>
            <div className={styles.label}>
              {formatMessage({ id: 'task.text.ccap', defaultMessage: '批次安排' })}：
            </div>
            <div className={styles.info}>
              {`${examDates[1] +
                formatMessage({ id: 'task.text.month', defaultMessage: '月' }) +
                examDates[2] +
                formatMessage({
                  id: 'task.text.date',
                  defaultMessage: '日',
                })} ${examBatchTime} ${examBatch},${examRoom}`}
            </div>
          </div>
        </div>
      );
    } else {
      jsx = (
        <div className={styles.center}>
          <div className={styles.error}>
            <i className="iconfont icon-error" />
          </div>
          <div className={cs(styles.confirmTip)}>
            {formatMessage({ id: 'task.text.czkssb', defaultMessage: '重新考试设置失败' })}
          </div>
          <div className={cs(styles.normal_text)}>
            <div className={styles.info}>{res.message}</div>
          </div>
        </div>
      );
    }

    this.setState({
      infoVisible: true,
      jsx,
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
          const aVal = a.classIndex ? a.classIndex : a.className;
          const bVal = b.classIndex ? b.classIndex : b.className;
          val = (aVal || '').localeCompare(bVal || '');
        } else {
          val = (String(a[columnKey]) || '').localeCompare(String(b[columnKey]) || '');
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
    const {
      tabType,
      filterClassId,
      searchKey,
      showTable,
      examPlaceValue,
      examPlaceVisible,
      current: pageIndex,
    } = this.state;
    const {
      paperList: paperListStr,
      studentList: studentListstr,
      classList: classListStr,
      taskType,
      onClose,
      sizeType,
      examFailReson,
      examPlaceInfo,
      status,
    } = this.props;

    let current = false;
    let other = false;

    if (examPlaceInfo.currentSubTask) {
      if (examPlaceInfo.currentSubTask.status !== 'TS_2') {
        current = true;
      }
    }

    if (examPlaceInfo.prepareSubTask) {
      if (examPlaceInfo.prepareSubTask.length == 0) {
        other = true;
      }
    }
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

      // 显示缺考
      if (list.includes('absentJoin') && item.taskAble === true && item.taskStatus === 'ES_0') {
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

    // console.log(students)
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
        title: formatMessage({ id: 'task.text.makeup.Reference', defaultMessage: '补考' }),
        count: students.filter(item => !item.taskAble).length,
      },
      {
        key: 'absentJoin',
        title: formatMessage({ id: 'task.text.absent.join', defaultMessage: '缺考' }),
        count: students.filter(item => item.taskStatus === 'ES_0' && item.taskAble).length,
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

    const examPlaceColumns = [
      {
        title: formatMessage({ id: 'task.text.ksrq', defaultMessage: '考试日期' }),
        dataIndex: 'ueInfo',
        width: 380,
        render: ueInfo => (
          <span>{`${this.timestampToTime(ueInfo.examDate)} ${ueInfo.examBatchTime}`}</span>
        ),
      },
      {
        title: formatMessage({ id: 'task.title.session', defaultMessage: '批次' }),
        dataIndex: 'examBatch',
        width: 150,
        render: (_, record) => <span>{record.ueInfo.examBatch}</span>,
      },
      {
        title: formatMessage({ id: 'task.text.kaochang', defaultMessage: '考场' }),
        dataIndex: 'examRoom',
        width: 150,
        render: (_, record) => <span>{record.ueInfo.examRoom}</span>,
      },
      {
        title:
          examPlaceInfo.prepareSubTask &&
          examPlaceInfo.prepareSubTask[0] &&
          examPlaceInfo.prepareSubTask[0].ueInfo.hasLimited === 'Y'
            ? formatMessage({ id: 'task.text.sy', defaultMessage: '剩余' })
            : formatMessage({ id: 'task.text.have.arranged', defaultMessage: '已安排' }),
        dataIndex: 'enrolledNum',
        width: 150,
        render: (_, record) => {
          if (record.ueInfo.hasLimited === 'Y') {
            return <span>{record.ueInfo.examRemainder}</span>;
          }
          return <span>{record.ueInfo.enrolledNum}</span>;
        },
      },
      {
        title: formatMessage({ id: 'task.title.options', defaultMessage: '操作' }),
        dataIndex: 'options',
        width: 100,
        render: (_, record) => (
          <span>
            <Radio
              checked={
                this.state.currentSubTask && record.taskId === this.state.currentSubTask.taskId
              }
              key={`record${record.taskId}`}
              onChange={e => {
                this.setState({
                  ueInfo: record.ueInfo,
                  currentSubTask: record,
                });
              }}
            >
              选择
            </Radio>
          </span>
        ),
      },
    ];

    // table标签数组
    const columns = [
      {
        title: formatMessage({ id: 'task.title.sutdent.code', defaultMessage: '考号' }),
        dataIndex: 'examNo',
        width: 220,
        sorter: true,
        className: 'studentNameWidth',
        render: examNo => <span>{examNo}</span>,
      },
      {
        title: formatMessage({ id: 'task.title.name', defaultMessage: '姓名' }),
        dataIndex: 'studentName',
        sorter: true,
        width: 120,
        render: (studentName, record) => {
          const examFlag = record.examFlag;
          const { taskAble } = record;

          let jsx = null;
          if (examFlag) {
            jsx = examFlag.split(',').map((item, index) => {
              if (item === 'MAKE_UP_EXAM') {
                return (
                  <Tooltip
                    title={formatMessage(
                      { id: 'task.text.ybktime', defaultMessage: '已补考{times}次' },
                      { times: record.makeUpCount }
                    )}
                  >
                    <div className={styles.nameTag2}>补</div>
                  </Tooltip>
                );
              }
              if (item === 'APPLY') {
                return (
                  <Tooltip
                    title={formatMessage({ id: 'task.text.xcbm', defaultMessage: '现场报名' })}
                  >
                    <div className={styles.nameTag1}>报</div>
                  </Tooltip>
                );
              }
              return null;
            });
          }

          if (!taskAble) {
            jsx = null;
            if (examFlag && examFlag.includes('APPLY')) {
              jsx = (
                <Tooltip
                  title={formatMessage({ id: 'task.text.xcbm', defaultMessage: '现场报名' })}
                >
                  <div className={styles.nameTag1}>报</div>
                </Tooltip>
              );
            }
          }

          return (
            <div className={styles.studentName}>
              <Tooltip title={studentName}>
                <span className={styles['class-name']}>{studentName}</span>
              </Tooltip>
              {jsx}
            </div>
          );
        },
      },
      // {
      //   title : formatMessage({id:"task.title.gender",defaultMessage:"性别"}),
      //   dataIndex: 'gender',
      //   width :80,
      //   render : (gender)=>(
      //     <span>
      //       {
      //         {
      //           'MALE':formatMessage({id:"task.text.male",defaultMessage:"男"}),
      //           "FEMALE":formatMessage({id:"task.text.female",defaultMessage:"女"})
      //         }[gender] || ""
      //       }
      //     </span>
      //   )
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
            if (!taskAble) return <span>--</span>; // config.unTask
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
        render: (val, record) => {
          const { taskAble } = record;

          if (!taskAble) {
            return '--';
          }
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
        title: formatMessage({
          id: 'task.title.answer.package.status',
          defaultMessage: '答卷包状态',
        }),
        width: 150,
        dataIndex: 'respondentsStatus',
        render: (_, record) => {
          const { taskStatus, respondentsStatus, taskAble } = record;

          if (!taskAble) {
            return '--';
          }

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
        title: formatMessage({ id: 'task.title.handle.error', defaultMessage: '异常处理' }),
        dataIndex: 'options',
        align: 'center',
        width: 120,
        render: (_, record) => {
          const { taskAble, taskStatus, studentId, loading = false, studentName, taskId } = record;

          let content = null;
          // if( !taskAble ){
          //   // 如果是不参加的学生--则：显示 参加考试
          //   const joinText = taskType === "exam" ?
          //     formatMessage({id:"task.message.join.exam",defaultMessage:"参加考试"}) :
          //     formatMessage({id:"task.message.join.practice",defaultMessage:"参加练习"});
          //   content = <a onClick={()=>this.confirmFn( studentId, studentName, "inJoin", taskId, record )}>{joinText}</a>;
          // }else
          if (
            (taskAble && // 是否参加考试
            status === 'TS_2' && // 子任务状态判断
            (taskStatus === null ||
              taskStatus === 'ES_1' ||
              taskStatus === 'ES_3' ||
              taskStatus === 'ES_4') && // 学生考试状态
              taskType === 'exam') ||
            (['ES_3', 'ES_4'].includes(taskStatus) && taskType === 'practice')
          ) {
            // 只有考试失败的学生才能重新考试或重新练习
            const reText =
              taskType === 'exam'
                ? formatMessage({ id: 'task.message.re.exam', defaultMessage: '重新考试' })
                : formatMessage({ id: 'task.message.re.practice', defaultMessage: '重新练习' });
            content = (
              <a onClick={() => this.confirmFn(studentId, studentName, 'reJoin', taskId, record)}>
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
      {
        title: formatMessage({ id: 'task.text.dealresult', defaultMessage: '处理结果' }),
        dataIndex: 'processResult',
        // align : "center",
        width: 180,
        render: processResult => <span>{processResult}</span>,
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
            ref={this.getScrollDom}
            rowKey="studentId"
            className={cs(styles.table)}
            columns={columns}
            scroll={scroll}
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
              current: pageIndex,
              onChange: this.changePage,
            }}
            size="small"
            onChange={this.onTableChange}
          />
        </div>

        {/* 安排本考场和其他考场 */}
        <Modal
          visible={this.state.examPlaceVisible}
          className={styles.confirm}
          onCancel={e => {
            this.setState({
              examPlaceVisible: false,
            });
          }}
          width={360}
          closable
          footer={
            <div className={styles.footerbtn}>
              <div className={styles.warntext}>{this.state.warntext}</div>

              <button
                type="button"
                className="ant-btn ant-btn-main ant-btn-round"
                onClick={() => {
                  if (current && other) {
                    this.setState({
                      examPlaceVisible: false,
                    });
                  } else {
                    this.handleExamPlace();
                  }
                }}
              >
                <span>
                  {current && other
                    ? formatMessage({
                        id: 'task.text.add.new.student.know',
                        defaultMessage: '我知道了',
                      })
                    : formatMessage({ id: 'task.text.nextstep', defaultMessage: '下一步' })}
                </span>
              </button>
            </div>
          }
        >
          <div>
            <div className={styles.tip}>
              {formatMessage({ id: 'task.placeholder.please.select', defaultMessage: '请选择' })}
            </div>
            <Radio.Group
              name="radiogroup"
              defaultValue={this.state.examPlaceValue}
              style={{ width: '100%' }}
              onChange={e => {
                this.setState({ examPlaceValue: e.target.value });
              }}
            >
              <div className={cs(styles.card, styles.first)}>
                <Radio value="1" disabled={current}>
                  {formatMessage({ id: 'task.text.current', defaultMessage: '当前批次/考场' })}
                </Radio>
              </div>
              <div className={styles.card}>
                <Radio value="2" disabled={other}>
                  {formatMessage({ id: 'task.text.other', defaultMessage: '其他批次/考场' })}
                </Radio>
              </div>
            </Radio.Group>
            {current && other && (
              <div className={styles.warntip}>
                {formatMessage({
                  id: 'task.text.warntip',
                  defaultMessage: '暂无空位，无法安排当前考生',
                })}
              </div>
            )}
          </div>
        </Modal>

        {/* 安排其他场次 */}
        <Modal
          visible={this.state.choosePlaceVisible}
          onCancel={e => {
            this.setState({
              choosePlaceVisible: false,
            });
          }}
          className={styles.confirm}
          width={653}
          closable
          footer={
            <div className={styles.footerbtn}>
              <div className={styles.warntext}>{this.state.warntext}</div>
              <div>
                <button
                  type="button"
                  className="ant-btn ant-btn-round"
                  onClick={() => {
                    this.setState({
                      choosePlaceVisible: false,
                      examPlaceVisible: true,
                    });
                  }}
                >
                  <span>
                    {' '}
                    {formatMessage({ id: 'task.text.prestep', defaultMessage: '上一步' })}
                  </span>
                </button>
                <button
                  type="button"
                  className="ant-btn ant-btn-main ant-btn-round"
                  onClick={() => {
                    this.confirmExamInfo();
                  }}
                >
                  <span>
                    {formatMessage({ id: 'task.text.nextstep', defaultMessage: '下一步' })}
                  </span>
                </button>
              </div>
            </div>
          }
        >
          <div>
            <div className={styles.tip}>
              {formatMessage({ id: 'task.text.apcckc', defaultMessage: '安排批次/考场' })}
            </div>
            <Table
              rowKey="studentId"
              className={cs(styles.table)}
              columns={examPlaceColumns}
              dataSource={this.props.examPlaceInfo.prepareSubTask || []}
              locale={{
                emptyText: getEmptyRender(
                  noneCardIcon,
                  formatMessage({ id: 'task.text.noData', defaultMessage: '暂无数据' })
                ),
              }}
              pagination={false}
              size="small"
            />
          </div>
        </Modal>

        {/* 安排开场结果信息提示 */}
        <Modal
          visible={this.state.infoVisible}
          footer={
            <div
              className={styles.bottom_btn}
              onClick={() => {
                this.setState({
                  infoVisible: false,
                });
              }}
            >
              我知道了
            </div>
          }
          className={styles.confirm}
          width={460}
          closable={false}
        >
          {this.state.jsx}
        </Modal>
      </Card>
    );
  }
}
export default TaskDetail;
