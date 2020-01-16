import React, { PureComponent } from 'react';
import { Divider, Modal, message } from 'antd';
import Avatar from '@/pages/components/Avatar';
import { connect } from 'dva';
import cs from 'classnames';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import Dimensions from 'react-dimensions';
import cloudBg from '@/assets/teacher/index_page_bg_cloud@2x.png';
import startBg from '@/assets/teacher/index_page_bg_star@2x.png';
import taskIcon1Hover from '@/assets/examination/task_icon_1_hover.png';
import taskIcon1 from '@/assets/examination/task_icon_1.png';
import taskIcon2Hover from '@/assets/examination/task_icon_2_hover.png';
import taskIcon2 from '@/assets/examination/task_icon_2.png';
import taskIcon3Hover from '@/assets/examination/task_icon_3_hover.png';
import taskIcon3 from '@/assets/examination/task_icon_3.png';
import taskIcon4Hover from '@/assets/examination/task_icon_4_hover.png';
import taskIcon4 from '@/assets/examination/task_icon_4.png';
import taskIcon5Hover from '@/assets/examination/task_icon_5_hover.png';
import taskIcon5 from '@/assets/examination/task_icon_5.png';
import PublishCard from './components/PublishCard';
import Carousel from './components/Carousel';
import { sendM, closeAllStudent } from '@/utils/instructions';
import { getTaskInfo, proxyTokenDelete } from '@/services/teacher';
import defaultAvatar from '@/assets/teacher/avarta_teacher.png';
import styles from './index.less';

const { vb } = window;

const dataSource = () => [
  {
    title: formatMessage({ id: 'task.title.task.type.TT_1', defaultMessage: '本班考试' }),
    tip: formatMessage({
      id: 'task.text.task.type.TT_1.tip',
      defaultMessage: '组织我任教班级的考试',
    }),
    code: 'TT_1',
    isuse: true,
    img: taskIcon1,
    imghover: taskIcon1Hover,
    content: [
      formatMessage({
        id: 'task.text.task.type.TT_1.detail1',
        defaultMessage: '一场考试用三步操作完成',
      }),
      formatMessage({
        id: 'task.text.task.type.TT_1.detail2',
        defaultMessage: '支持口语开放性题型评测',
      }),
      formatMessage({
        id: 'task.text.task.type.TT_1.detail3',
        defaultMessage: '详尽的考后学情分析报告',
      }),
    ],
    permissionCode: 'V_SINGLE_CLASS_EXAM',
  },
  {
    title: formatMessage({ id: 'task.title.task.type.TT_3', defaultMessage: '多班联考' }),
    tip: formatMessage({
      id: 'task.text.task.type.TT_3.tip',
      defaultMessage: '协调非任教班级的考试',
    }),
    code: 'TT_3',
    isuse: true,
    img: taskIcon2,
    imghover: taskIcon2Hover,
    content: [
      formatMessage({
        id: 'task.text.task.type.TT_3.detail1',
        defaultMessage: '简化组织小型校内联考难度',
      }),
      formatMessage({
        id: 'task.text.task.type.TT_3.detail2',
        defaultMessage: '支持传统行政班制和走班制',
      }),
      formatMessage({
        id: 'task.text.task.type.TT_3.detail3',
        defaultMessage: '人工纠偏和趋势分析更细腻',
      }),
    ],
    permissionCode: 'V_MULTI_CLASS_EXAM',
  },
  {
    title: formatMessage({ id: 'task.title.task.type.TT_2', defaultMessage: '课堂练习' }),
    tip: formatMessage({
      id: 'task.text.task.type.TT_2.tip',
      defaultMessage: '组织我任教班级的训练',
    }),
    code: 'TT_2',
    isuse: true,
    img: taskIcon3,
    imghover: taskIcon3Hover,
    content: [
      formatMessage({
        id: 'task.text.task.type.TT_2.detail1',
        defaultMessage: '学生自由掌控训练过程',
      }),
      formatMessage({
        id: 'task.text.task.type.TT_2.detail2',
        defaultMessage: '实时的评测和结果分析',
      }),
      formatMessage({
        id: 'task.text.task.type.TT_2.detail3',
        defaultMessage: '课堂上可进行互动讲评',
      }),
    ],
    permissionCode: 'V_CLASSROOM_EXERCISES',
  },
  {
    title: formatMessage({ id: 'task.title.task.type.TT_4', defaultMessage: '专项练习' }),
    tip: formatMessage({
      id: 'task.text.task.type.TT_4.tip',
      defaultMessage: '组织我任教班级的训练',
    }),
    isuse: false,
    code: 'TT_7',
    img: taskIcon4,
    imghover: taskIcon4Hover,
    content: [
      formatMessage({
        id: 'task.text.task.type.TT_4.detail1',
        defaultMessage: '针对薄弱知识的专项训练',
      }),
      formatMessage({
        id: 'task.text.task.type.TT_4.detail2',
        defaultMessage: '大数据驱动学科能力分析',
      }),
      formatMessage({
        id: 'task.text.task.type.TT_4.detail3',
        defaultMessage: '不同学情学生的策略推荐',
      }),
    ],
    permissionCode: 'V_SPECIAL_TRAINING',
  },
  {
    title: formatMessage({ id: 'task.title.task.type.TT_6', defaultMessage: '区校统考' }),
    tip: formatMessage({
      id: 'task.text.task.type.TT_6.tip',
      defaultMessage: '区校组织的大范围考试',
    }),
    code: 'TT_6',
    isuse: true,
    img: taskIcon5,
    imghover: taskIcon5Hover,
    content: [
      formatMessage({
        id: 'task.text.task.type.TT_6.detail1',
        defaultMessage: '完全符合本地中高考流程',
      }),
      formatMessage({
        id: 'task.text.task.type.TT_6.detail2',
        defaultMessage: '一键考场环境的健康检查',
      }),
      formatMessage({
        id: 'task.text.task.type.TT_6.detail3',
        defaultMessage: '强大的区校联动分析功能',
      }),
    ],
    permissionCode: 'V_UNITED_EXAM',
  },
];

@Dimensions({
  getHeight: () => window.innerHeight,
  getWidth: () => window.innerWidth,
})
@connect(({ teacher, dictionary }) => {
  const { TASK_TYPE = [] } = dictionary;
  const { taskCount = [], userInfo = {} } = teacher;
  const { accountId, teacherName, inCurrentCampus, teacherList } = userInfo;
  return {
    TASK_TYPE, // 任务类型code字典
    taskCount, // 统计数据对象
    accountId, // 账号的id
    teacherName, // 教师名称
    inCurrentCampus, // 是否在当前校区
    teacherList, // 教师拥有的全部账号
  };
})
class Home extends PureComponent {
  vbCache = {}; // 获取 vbClient 中 保存的数据

  // 当前页面要显示的列表
  showTaskTypes = ['TT_1', 'TT_3', 'TT_2', 'TT_6']; // 依次为， 本班考试， 多班考试， 练习， 区校统考

  state = {
    visible: false,
    taskName: '',
    taskId: '',
    showVisble: false,
    visibleTask: false,
    endTeacherName: '',
    taskType: '',
  };

  constructor(props) {
    super(props);
    const { inCurrentCampus } = props;
    if (!inCurrentCampus) {
      // 如果该教师，不在当前校区，则，只能显示 统考
      this.showTaskTypes = this.showTaskTypes.filter(item => item === 'TT_6');
    }
  }

  componentDidMount() {
    const { dispatch, accountId } = this.props;
    // 获取上次未完成的考试任务
    localStorage.removeItem('publishReload');
    const obj = vb.getStorageManager().get({ key: accountId });

    if (obj && obj.value) {
      const strToObj = JSON.parse(obj.value);
      if (strToObj && strToObj.monitorInfo && strToObj.monitorInfo.length > 0) {
        this.setState({
          taskId: strToObj.task_id,
        });
        this.vbCache = strToObj || {};
        dispatch({
          type: 'teacher/getNowTaskStatus',
          payload: strToObj.task_id,
          callback: data => {
            if (
              !(
                data.status === 'TS_2' &&
                (data.linkStatus === 'ES_1' ||
                  data.linkStatus === 'ES_2' ||
                  data.linkStatus === 'ES_3' ||
                  data.linkStatus === 'ES_4' ||
                  data.linkStatus === 'ES_5' ||
                  data.linkStatus === 'ES_6')
              )
            ) {
              this.setState({
                visibleTask: true,
                endTeacherName: data.endTeacherName,
              });
            } else {
              getTaskInfo(strToObj.task_id).then(res => {
                if (res.responseCode === '200') {
                  this.setState({
                    taskName: res.data.name,
                    taskType: res.type,
                  });
                }
              });
              this.setState({
                visible: true,
              });
            }
          },
        });
      }
    }
    // 获取考试，练习，联考的任务统计数
    dispatch({ type: 'teacher/getTaskCount', payload: this.showTaskTypes });
  }

  handleOk = () => {
    this.setState({
      visible: false,
    });
    const { taskId } = this.state;
    router.push(`/teacher/task/${taskId}`);
  };

  handleCancel = () => {
    const { accountId, dispatch, teacherList } = this.props;
    const { taskId } = this.state;
    const { campusId } = this.vbCache;
    // 通过考试学校的campauseId获取teacherId
    const { teacherId } = teacherList.find(item => item.campusId === campusId) || {};

    sendM('clean', '');
    vb.getStorageManager().remove({ key: accountId });
    let client = [];
    client = vb.getSocketManager().clients;
    const ipAddr = client.map(item => `student_${item.ipAddress}`);
    // 删除监控数据
    dispatch({
      type: 'task/saveBatch',
      payload: {
        taskId,
        status: '2',
        teacherId,
      },
    });
    // 清除学生token
    proxyTokenDelete(ipAddr).then(res => {
      if (res.responseCode === '200') {
        this.setState({
          visible: false,
          visibleTask: false,
        });
      } else {
        message.warning(res.data);
      }
    });
    this.vbCache = {};
  };

  handleCancelTask = () => {
    this.setState({
      visibleTask: false,
    });
  };

  /**
   * @description: 启用一键检测按钮
   * @param {type}
   * @return:
   */
  autoCheck = () => {
    sendM('clean', '');
    const { dispatch } = this.props;
    dispatch({
      type: 'teacher/autoCheck',
    });
  };

  showOper = () => {
    const { showVisble } = this.state;
    this.setState({
      showVisble: !showVisble,
    });
  };

  closeAll = () => {
    // 关闭学生机二次确认框
    Modal.confirm({
      title: null,
      width: 400,
      content: (
        <span className={styles.closeConfirm}>
          {formatMessage({ id: 'task.text.yesornoclose', defaultMessage: '是否关闭' })}
          <span>{formatMessage({ id: 'task.text.connected', defaultMessage: '已连接' })}</span>
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
        // sendM('close', '')
        closeAllStudent();
        let client = [];
        client = vb.getSocketManager().clients;
        const ipAddr = client.map(item => `student_${item.ipAddress}`);
        // 清除学生token
        proxyTokenDelete(ipAddr).then(res => {
          if (res.responseCode === '200') {
            this.setState({
              visible: false,
              visibleTask: false,
            });
            message.success(
              formatMessage({
                id: 'task.message.connect.students.closed',
                defaultMessage: '连接的学生机已关闭',
              })
            );
          } else {
            message.warning(res.data);
          }
        });
      },
    });
  };

  // 获取统计数据的render
  taskTypesCountRender = () => {
    const { taskCount, TASK_TYPE } = this.props;
    return this.showTaskTypes.map((item, key) => {
      const { taskCount: count = 0 } = taskCount.find(tag => tag.taskType === item) || {};
      const { value } = TASK_TYPE.find(tag => tag.code === item) || {};
      return (
        <React.Fragment key={item}>
          {key !== 0 ? <Divider className={styles.divider} type="vertical" /> : null}
          <div className={styles.item}>
            <div className={styles.num}>{count}</div>
            <div className={styles.name}>{value}</div>
          </div>
        </React.Fragment>
      );
    });
  };

  // 根据条件，显示要能显示的 card
  taskCardsRender = () => {
    const dataSourceItem = dataSource();
    const { TASK_TYPE } = this.props;
    return this.showTaskTypes.map(item => {
      const { value } = TASK_TYPE.find(tag => tag.code === item) || {};
      const data = dataSourceItem.find(tag => tag.code === item);
      data.title = value;
      return <PublishCard key={item} data={data} />;
    });
  };

  render() {
    const { teacherName, accountId } = this.props;
    const { taskName, visible, showVisble, visibleTask, endTeacherName, taskType } = this.state;

    return (
      <div
        className={styles.content}
        style={{ backgroundImage: `url(${cloudBg}),url(${startBg})` }}
      >
        <div className={styles.userInfo}>
          <Avatar size={60} icon="user" src={defaultAvatar} accountId={accountId} />
          <div className={styles['user-name']}>{teacherName}</div>
          <div className={styles.list}>
            {// 获取 统计数据的显示
            this.taskTypesCountRender()}
          </div>
        </div>
        <div className={styles.examination}>
          <div className={styles.divCarousel}>
            <Carousel
              ref={dom => {
                this.carousel = dom;
              }}
            >
              {// 显示内容卡片
              this.taskCardsRender()}
            </Carousel>
          </div>
        </div>
        <div className={styles.check}>
          <div className={styles.checkList} hidden={!showVisble}>
            <div className={styles.bgOpcaity} />
            <div className={styles.checking} onClick={this.autoCheck}>
              <span className={cs('iconfont', 'icon-computer-ai', styles.computer)} />
              <br />
              <span className={styles['check-text']}>
                {formatMessage({ id: 'task.button.vbclient.check', defaultMessage: '环境检测' })}
              </span>
            </div>
            {/* <div className={styles.onStart}>
              <span className={cs("iconfont","icon-v-play",styles.computer)} />
              <br />
              <span className={styles["check-text"]}>开启学生机</span>
            </div> */}
            <div className={styles.closing} onClick={this.closeAll}>
              <span className={cs('iconfont', 'icon-shut_down', styles.computer)} />
              <br />
              <span className={styles['check-text']}>
                {formatMessage({ id: 'task.text.closeStudent', defaultMessage: '关闭学生机' })}
              </span>
            </div>
            <div className={styles.closed} onClick={this.showOper}>
              <span className={cs('iconfont', 'icon-close', styles.computer)} />
            </div>
          </div>
          <div hidden={showVisble} onClick={this.showOper} className={styles.operation}>
            <span className={cs('iconfont', 'icon-group', styles.computer)} />
            <br />
            <span className={styles['check-text']}>
              {formatMessage({ id: 'task.text.common.functions', defaultMessage: '常用功能' })}
            </span>
          </div>
        </div>

        <Modal
          title=""
          visible={visible}
          onOk={this.handleOk}
          closable={false}
          onCancel={this.handleCancel}
          cancelText={formatMessage({ id: 'task.button.not.handle', defaultMessage: '不做处理' })}
          okText={formatMessage({ id: 'task.button.enter.handle', defaultMessage: '进入处理' })}
          style={{ top: 300 }}
          width={480}
          className="modalLayer"
          maskClosable={false}
        >
          <div className={styles.warningInfo}>!</div>
          <p className="f16">{taskName}</p>
          <p className="f14">
            {formatMessage({
              id: 'task.text.handle.not.finished.task',
              defaultMessage: '任务未正常结束，请处理！',
            })}
          </p>
        </Modal>
        <Modal
          title=""
          visible={visibleTask}
          closable={false}
          onCancel={this.handleCancel}
          cancelText={formatMessage({ id: 'task.button.ok', defaultMessage: '确定' })}
          okText={formatMessage({ id: 'task.button.ok', defaultMessage: '确定' })}
          style={{ top: 300 }}
          width={480}
          className="modalLayerTask"
          maskClosable={false}
        >
          <div className={styles.warningInfo}>!</div>
          <p className="f16">{taskName}</p>
          <p className="f14">
            {formatMessage(
              {
                id: 'task.text.task.is.invalid',
                defaultMessage: '任务已被{name}结束，本场{task}数据无效！',
              },
              {
                name: endTeacherName,
                task:
                  taskType === 'TT_2'
                    ? formatMessage({ id: 'task.text.Practicing', defaultMessage: '练习' })
                    : formatMessage({ id: 'task.text.testExam', defaultMessage: '考试' }),
              }
            )}
          </p>
        </Modal>
      </div>
    );
  }
}

export default Home;
