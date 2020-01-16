import React, { Component } from 'react';
import { connect } from 'dva';
import { Input, Tag, Divider, Tooltip, Avatar } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import router from 'umi/router';
import cs from 'classnames';
import { sendM } from "@/utils/instructions";
import Modal from "@/components/Modal";
import FontButton from "@/pages/Teacher/components/FontButton";
import BatchesStudentCount  from "./popup/BatchesStudentCount";
import taskType from "@/pages/Teacher/taskType";
import defaultAvatar from '@/assets/teacher/avarta_teacher.png';
import styles from './index.less';

@connect(({ dictionary, loading },{ teacherType="" }) =>{
  const { TASK_STATUS=[], LINKSTATUS=[] } = dictionary;
  const runTask     = loading.effects['teacher/runTask'];
  const delTask      = loading.effects['teacher/delTask'];
  const beforeEndTask = loading.effects['teacher/beforeEndTask'];
  const endTask = loading.effects['teacher/endTask'];

  // 文档路径-- 18.9	任务列表-不同角色对任务权限的调整
  // 根据 teacherType 获取当前老师的类型
  // MASTER	发布老师
  // SUB	代课老师
  // TEACHER	任课教师
  // 返回的teacherType可能是
  // Master
  // Sub
  // Teacher
  // Master,Teacher  属于Master
  // Sub,Teacher 属于Sub
  const teacherRole = teacherType.split(",") || [];


  return {
    runTask,              // 开始测试或继续测试的loading
    beforeEndTask,        // 点击结束按钮前的操作
    endTask,              // 结束任务的loading状态
    delTask,              // 删除任务的loading状态
    TASK_STATUS,          // 任务状态字典库
    LINKSTATUS,           // 任务的环节状态字典库
    teacherRole           // 当前任务中对于当前教师的角色( Master,SUB,TEACHER )
  };
})
class TaskList extends Component {

  state = {
    editTitle : false,       // 编辑名称
    taskTitle : "",       // 新的名称
  }

  // 更新任务列表
  getTaskData = ( params={} )=>{
    const { dispatch } = this.props;
    dispatch({
      type    : 'teacher/getTaskData',
      payload : params
    });
  }

  // ====================tasklist按钮触发事件 ======================

  // 点击开始按钮
  clickBeginBtn = ()=>{
    const { dispatch, taskId, type } = this.props;
    const { name } = taskType(type);
    // 调用vb.getSocketManager().clientsInfo 获取学生机所有的状态
    const list = window.vb.getSocketManager().clients || [];
    const inTaskCount = list.reduce((arr,item)=>{
      const { data } = item;
      if( data ){
        const info = JSON.parse(data);
        if( info.netStatus==="MS_1" && !["MS_1","MS_10"].includes(info.binessStatus) ){
          arr.push({
            ...item,
            ...info
          })
        }
      }
      return arr;
    },[]);

    if( inTaskCount.length === 0 ){
      dispatch({
        type : "teacher/runTask",
        payload : taskId
      });
    }else{
      // 弹框提示,是否确认新任务
      // 弹出框
      Modal.confirm({
        title : "",
        width : 480,
        className : styles.confirm,
        content : (
          <div>
            <span className={cs('iconfont','icon-tip',styles['icon-tip'])} />
            <div className={styles.info}>
              <div className={styles.warning}>
                {formatMessage({id:"task.message.has.student.unfinished.type",defaultMessage:"有学生未结束{type}！"},{"type":name})}
              </div>
              <div className={styles.label}>
                {formatMessage({id:"task.text.click.running.pre.task",defaultMessage:"点击“开始”将结束上一场{name}"},{"name":name})}
                <br />
                {formatMessage({id:"task.message.do.sure.beginning",defaultMessage:"是否确认开始？"})}
              </div>
            </div>
          </div>
        ),
        icon : null,
        centered : true,
        autoFocusButton : null,
        okText     : formatMessage({id:"task.button.begin",defaultMessage:"开始"}),
        cancelText : formatMessage({id:"task.button.cancel",defaultMessage:"取消"}),
        okButtonProps : {
          type     : "warn",
          shape    : "round"
        },
        cancelButtonProps : {
          shape    : "round",
          type     : "",
        },
        onOk : ()=>{
          // 发送指令beforeProcess
          sendM("beforeProcess",{type:"beforeProcess"});
          // 继续开始任务
          dispatch({
            type : "teacher/runTask",
            payload : taskId
          });
        }
      })
    }
  }

  // 点击结束按钮
  endTask = async ( studentExamInfo )=>{
    const { dispatch, taskId } = this.props;
    await dispatch({
      type : "teacher/endTask",
      payload : {
        taskId,
        studentExamInfo
      }
    });
    // 结束任务以后刷新列表
    this.getTaskData();
  }

  // 检测点击结束按钮
  beforeEndTask = async ()=>{
    const { dispatch, taskId, type } = this.props;

    // 通过获取最新的轮训状态，和监控状态，判断是否能够结束任务
    const result = await dispatch({
      type : "teacher/beforeEndTask",
      payload : taskId
    });

    // 如果检测通过则打开弹框，确认能否结束任务
    if( result ){
      const { noExamStudentCount, batchInfo=[], studentExamInfo=[] } = result;
      if( noExamStudentCount !== 0 || batchInfo.length !== 0 || studentExamInfo.length !== 0 ){
        // 弹出框
        Modal.confirm({
          title : formatMessage({id:"task.title.current.task.detail",defaultMessage:"考试情况"}),
          width : 680,
          content : (
            <BatchesStudentCount
              type={type}
              noExamStudentCount={noExamStudentCount}
              batchInfo={batchInfo}
              studentExamInfo={studentExamInfo}
              endTask={this.endTask}
            />
          ),
          icon : null,
          centered : true,
          okButtonProps : {
            type : "warn",
            shape : "round"
          },
          cancelButtonProps : {
            shape : "round"
          }
        })
      }else{
        this.endTask();
      }
    }else{
      this.getTaskData();
    }
  }

  // 删除任务
  delTask = () =>{
    const { dispatch, taskId, name } = this.props;

    const tpl = (
      <FormattedMessage
        id="task.message.do.sure.delete"
        values={{name:<span className={styles['del-task']}>{name}</span>}}
        defaultMessage="删除{name}，是否确认？"
      />
    )
    Modal.confirm({
      title : null,
      width : 400,
      content : tpl,
      icon : null,
      centered : true,
      okButtonProps : {
        type : "warn",
        shape : "round"
      },
      cancelButtonProps : {
        shape : "round"
      },
      onOk : async ()=>{
        await dispatch({
          type : "teacher/delTask",
          payload : taskId
        });
        this.getTaskData()
      }
    });
  }

  // 获取任务详情
  showDetail = ()=>{
    const { taskId, type } = this.props;
    router.push(`/teacher/examination/publish/${type}/showTask/${taskId}`);

  }

  // 查看报告
  reportResult = () => {
    const { taskId, type } = this.props;
    router.push(`/teacher/report/${type}/showReport/${taskId}/score`);
  }

  // 分析结果
  analysisResult = () => {
    const { taskId, type } = this.props;
    router.push(`/teacher/report/${type}/showReport/${taskId}/analysis`);
  }

   // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ 任务名称 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

  /**
   * @description: 切换能否编辑任务名称
   * @param {type}
   * @return:
   */
  toggleEditTaskTile = () => {
    const { name } = this.props;
    // 打开编辑功能
    this.setState({
      editTitle : true,
      taskTitle : name,
    },()=>{
      this.taskTitleRef.input.focus();
    });
  };

  /**
   * @description: 保存修改的title
   * @param {type}
   * @return:
   */
  saveTaskTitle = async ()=>{
    const { dispatch, name, taskId } = this.props;
    const { taskTitle } = this.state;

    if( name ){
      const newTaskTitle = taskTitle.trim() || name;
      if( newTaskTitle !== name ){
        // 保存修改-并修改本地的modal
        await dispatch({
          type : "teacher/queryChangeTaskTitle",
          payload : {
            taskId,
            name : newTaskTitle
          }
        });
      }
      // 关闭编辑
      this.setState({
        editTitle  : false,
        taskTitle  : "",
      });
    }
  }

  /**
   * @description: 编辑任务的名称
   * @param {type}
   * @return:
   */
  changeTaskTitle = e => {
    this.setState({ taskTitle: e.target.value });
  };


  /**
   * 根据不同的类型或状态获取任务相关组件
   */
  getStatus = ()=>{
    const { runTask, delTask, TASK_STATUS, beforeEndTask, endTask, status, taskId, linkStatus, clickBindTaskId, inProcessing, teacherRole } = this.props;

    const obj = {
      color      : "",      // 标签颜色
      text       : "",      // 标签内容
      tag        : null,    // 标签
      buttonList : [],      // 按钮集合
    };
    switch (status) {
      case "TS_0":
      case "TS_0_1":
      case "TS_1":
          obj.color = "";
          obj.text = "TS_1";
          obj.buttonList = [{
            style   : cs(styles.button),
            loading : runTask,
            text    : formatMessage({id:"task.button.begin",defaultMessage:"开始"}),
            type    : "main",
            hide    : !['ES_1',"ES_2"].includes(linkStatus),
            icon    : "icon-v-play",
            fun     : this.clickBeginBtn
          },{
            style   : cs(styles.button),
            text    : formatMessage({id:"task.button.delete",defaultMessage:"删除"}),
            hide    : !['TS_1','TS_0_1',"TS_0"].includes(status) || teacherRole.every(item=>item==="TEACHER"),
            loading : delTask,
            type    : "warn",
            icon    : "icon-detele",
            fun     : this.delTask
          }];
        break;
      case "TS_2":
          obj.color = "green";
          obj.text = "TS_2";
          obj.buttonList = [{
            style   : cs(styles.button),
            loading : runTask,
            text    : formatMessage({id:"task.button.continue",defaultMessage:"继续"}),
            hide    : !['ES_2',"ES_5","ES_6"].includes(linkStatus),
            type    : "main",
            icon    : "icon-v-play",
            fun     : this.clickBeginBtn
          },{
            style   : cs(styles.button),
            text    : formatMessage({id:"task.button.end",defaultMessage:"结束"}),
            loading : endTask || beforeEndTask,
            hide    : !['ES_5',"ES_7","ES_9"].includes(linkStatus) || teacherRole.every(item=>item==="TEACHER"),
            type    : "warn",
            icon    : "icon-v-stop",
            fun     : this.beforeEndTask
          }];
        break;
      case "TS_3":
          obj.color = "orange";
          obj.text = 'TS_3';
        break;
      case "TS_4":
        obj.color = "blue";
        obj.text = 'TS_4';
        obj.buttonList = [{
          style : cs(styles.button),
          text  : formatMessage({id:"task.button.show.score.result",defaultMessage:"评分结果"}),
          hide  : !['ES_17'].includes(linkStatus) || teacherRole.every(item=>item!=="MASTER"),
          type  : "main",
          icon  : "icon-computer-ai",
          fun     : this.reportResult
        }];
        break;
      case "TS_5":
          obj.color = "";
          obj.text = "TS_5";
          obj.buttonList = [{
            style : cs(styles.button),
            text  : formatMessage({id:"task.button.show.analysis.report",defaultMessage:"分析报告"}),
            hide  :  teacherRole.every(item=>item==="SUB") || !['ES_21'].includes(linkStatus),
            type  : "main",
            icon  : "icon-statistics",
            fun   : this.analysisResult
          }];
        break;
      default:
        break;
    }

    // 添加默认的详情按钮
    obj.buttonList.push({
      style   : cs(styles.button),
      text    : formatMessage({id:"task.button.detail",defaultMessage:"详情"}),
      type    : "minor",
      icon    : "",
      fun     : this.showDetail
    });


    // 点击事件
    const bindOnClick = async (fn)=>{
      // 绑定点击的taskId,用于loading效果
      clickBindTaskId(taskId);
      // 同一个任务，执行期间只能执行一个
      if( obj.buttonList.every(item=>!item.loading) ){
        fn();
      }
    }

    // 生成标签
    if( obj.text ){
      // 获取 字典
      const { value } = TASK_STATUS.find(item=>item.code===obj.text) || {};
      obj.tag = <Tag className={styles['task-tag']} color={obj.color}>{value}</Tag>;
    }

    // 生成统一的按钮
    obj.buttons = obj.buttonList.filter(item=>!item.hide).map(item=>(
      <FontButton
        disabled={obj.buttonList.some(tag=>!!tag.loading)}
        loading={item.loading && inProcessing}
        key={item.text}
        shape="round"
        type={item.type}
        className={item.style}
        onClick={()=>bindOnClick(item.fun)}
        fontIcon={item.icon}
      >
        {item.text}
      </FontButton>
    ));
    return obj;
  }

  /**
   * 显示异常的link状态
   */
  getLinkStatusName = ()=>{
    const { LINKSTATUS, linkStatus } = this.props;
    if( ["ES_3","ES_7","ES_9","ES_15"].includes(linkStatus) ){
      const { value } = LINKSTATUS.find(item=>item.code===linkStatus) || {}
      return value || null;
    }
    return null;
  }

  /**
   * 是否显示未收到有效答卷
   * 在任务列表中，当考试状态=ES_4 且
   * effectiveAnswers = 0 显示“!未收到有效答卷”
   */
  effecticeAnswers = ()=>{
    const { status, effectiveAnswers } = this.props;
    return status === "TS_5" && effectiveAnswers === 0;
  }


  render() {
    const { status, name, classList, paperList, examNum, studentNum, teacher, monitorTeacher, type, teacherRole } = this.props;

    classList.sort((a,b)=>{
      const aVal = a.classIndex ? a.classIndex : a.className;
      const bVal = b.classIndex ? b.classIndex : b.className;
      return (aVal||"").localeCompare(bVal||"");
    });

    const { editTitle, taskTitle } = this.state;
    // 根据不同的任务类型获取不同的文案
    const copyWriting = taskType(type);
    // {
    //   ctualAttend  : "实考",
    //   shouldAttend : "应考",
    //   Invigilate   : "监考中"
    // }
    // 获取标签 ，和 按钮列表
    const itemObj = this.getStatus();
    // 获取特殊环节状态的提示
    const linkStatusName = this.getLinkStatusName();
    // 是否显示 为手动有效答卷
    const hasAnswer = this.effecticeAnswers();



    return (
      <li className={styles.task}>
        <div className={styles['task-content']}>
          { editTitle ? (
            <div className={styles['task-head']}>
              <Input
                className={styles['edit-task-title-input']}
                ref={val => {this.taskTitleRef = val}}
                value={taskTitle}
                onChange={this.changeTaskTitle}
                onPressEnter={this.saveTaskTitle}
                onBlur={this.saveTaskTitle}
                placeholder={formatMessage({id:"task.placeholder.input.task.name",defaultMessage:"请输入任务名称"})}
                maxLength={30}
              />
            </div>
          ) : (
            <div className={styles['task-head']}>
              <span className={styles['task-name']}>{name}</span>
              {
                ( status === "TS_0" || status === "TS_0_1" || status === "TS_1" ) && teacherRole.some(item=>item !== "TEACHER" ) && (
                  <span
                    className={cs('iconfont', 'icon-edit', styles['edit-icon'])}
                    onClick={this.toggleEditTaskTile}
                  />
                )
              }
              { itemObj.tag }
              { linkStatusName?<span className={cs("iconfont","icon-warning",styles["icon-warning"])}>{linkStatusName}</span>:null }
              {
                hasAnswer? (
                  <span className={cs("iconfont","icon-warning",styles["icon-warning"])}>
                    {formatMessage({id:"task.text.not.get.effective.answer",defaultMessage:"未收到有效答卷"})}
                  </span>
                ):null
              }
            </div>
          )}

          <div className={cs(styles['task-li'],styles.mb10)}>
            <span>{formatMessage({id:"task.title.class",defaultMessage:"班级："})}</span>
            <span className={styles['task-class']}>
              {classList.reduce((currentList,tag)=>{
                if( currentList.length > 0 ){
                  currentList.push(<Divider key={`${tag.classId}_left`} type="vertical" style={{margin:'0px 10px'}} />);
                }
                currentList.push(<span key={tag.classId}>{tag.className}</span>);
                return currentList;
              },[])}
            </span>
          </div>
        </div>
        <div className={styles['task-btns']}>
          {
            // 获取按钮列表
            itemObj.buttons
          }
        </div>
        <div className={styles['task-li']}>

          <span>{formatMessage({id:"task.title.test.paper",defaultMessage:"试卷："})}</span>
          <span className={styles['task-class']}>{paperList.length}</span>

          <Divider type="vertical" style={{margin:'0px 20px'}} />

          <span>{copyWriting.ctualAttend}/{copyWriting.shouldAttend}：</span>
          <span className={styles.numberOfActual}>{ examNum ||0 }</span>/{ studentNum || 0 }
          {formatMessage({id:"task.text.people",defaultMessage:"人"})}
          {
            teacher ? (
              <>
                <Divider type="vertical" style={{margin:'0px 20px'}} />
                <span>
                  {formatMessage({id:"task.title.substitute.teacher",defaultMessage:"代课老师："})}
                  <Avatar className={styles['avatar-img']} size={20} icon="user" src={teacher.path || defaultAvatar} />
                  {teacher.teacherName}
                </span>
              </>
            ) : null
          }

          {
            monitorTeacher && monitorTeacher.length>0 ? (
              <>
                <Divider type="vertical" style={{margin:'0px 20px'}} />
                <span>
                  {formatMessage({id:"task.title.inspection",defaultMessage:"监考中："})}
                  {
                    monitorTeacher.map((info)=>(
                      <Tooltip key={info.teacherId+info.batchNo} title={info.teacherName} mouseEnterDelay={0.3} getPopupContainer={trigger => trigger.parentNode}>
                        <Avatar className={styles['avatar-img']} size={20} icon="user" src={info.path || defaultAvatar} />
                      </Tooltip>
                    ))
                  }
                </span>
              </>
            ):null
          }

        </div>
      </li>
    )
  }
}
export default TaskList;
