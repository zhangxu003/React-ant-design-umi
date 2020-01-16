import React from 'react';
import { connect } from 'dva';
import ipBg from '@/assets/teacher/ip_bg_top_bar@2x.png';
import { Dropdown, Icon, Menu, Divider,Tooltip } from 'antd';
import { formatMessage } from 'umi/locale';
import Avatar from "@/pages/components/Avatar";
import cs from "classnames";
import { getcode } from '@/utils/instructions';
import winMax from "@/assets/teacher/window_max_btn_inside@2x.png";
import winMin from "@/assets/teacher/window_min_btn_inside@2x.png";
import winClose from "@/assets/teacher/window_close_btn_inside@2x.png";
import defaultAvatar from '@/assets/teacher/avarta_teacher.png';
import styles from './index.less';

@connect(({ teacher,vbClient }) => ({
  accountId   : teacher.userInfo.accountId,
  teacherId   : teacher.userInfo.teacherId,    // 教师id
  teacherName : teacher.userInfo.teacherName,  // 教师名称
  ipAddress   : vbClient.ipAddress,            // 终端的ip地址
}))
class CheckLayout extends React.PureComponent {

  constructor(props){
    super(props);
    const { dispatch } = props;
    // 请求后台用户信息
    dispatch({ type: 'teacher/getTeacherInfo' });
  }

  /**
   * @description: 监听设备的关闭事件
   * @param {type}
   * @return:
   */
  // onClientClose = ()=>{
  //   message.warning('当前页面为监考页面，客户端无法关闭！',2);
  // }

  /**
   * @description: 下拉菜单上的点击触发事件
   * @param {type}
   * @return:
   */
  onMenuClick = ({key})=>{
    const { dispatch } = this.props;
    // 登出事件
    if( key === "logout"  ){
      dispatch({
        type : "login/logout"
      });
    }
  };

  render() {
    const { teacherName, accountId, ipAddress, children, location } = this.props;

    // 判断是否在 任务监控页面
    // 监控页面的关闭按钮无效，并且提示 任务页面 无法关闭
    let inTaskWatchPage = false;
    if( location.pathname.indexOf("/teacher/task/")===0 && location.pathname.indexOf("/watch")!==-1 ){
      inTaskWatchPage = true;
    }

    const menu = (
      <Menu onClick={this.onMenuClick} className={styles.menu}>
        <Menu.Item key="1">
          <div className={styles.username}>{teacherName}</div>
        </Menu.Item>
        {/* <Menu.Divider />
        <Menu.Item key="2">
          <Icon type="question-circle" />使用帮助
        </Menu.Item> */}
        <Menu.Divider />
        <Menu.Item key="logout">
          <Icon type="export" />退出
        </Menu.Item>
      </Menu>
    );
    const resKey = getcode();
    const text = <span>{formatMessage({id:"task.text.teacher.control.code",defaultMessage:"用于处理学生机异常处理身份鉴权"})}</span>;
    const caretDownStyle = inTaskWatchPage ? {
      color : "rgba(22,153,92,0.3)"
    } : {
      color : "rgba(22,153,92,1)"
    };

    return (
      <div className={styles.container}>
        <div className={cs(styles.head, 'app-sys-command-container')}>
          <div className={styles.logo} style={{ backgroundImage: `url('http://res.gaocloud.local/logos/logo_top_bar@2x.png')` }} />
          <div className={styles.ip} style={{ backgroundImage: `url(${ipBg})` }}>IP {ipAddress}</div>
          <div className={styles['user-center']}>
            <span className={styles.colorWhite}>{formatMessage({id:"task.text.control.code",defaultMessage:"鉴权密钥：{code}"},{"code":resKey.code})}</span>
            <Tooltip placement="bottom" title={text}>
              <i className="iconfont icon-help" />
            </Tooltip>
            <Dropdown overlay={menu} className={styles['drap-menu']} disabled={inTaskWatchPage}>
              <a className="ant-dropdown-link" href="#">
                <Avatar icon="user" size={30} src={defaultAvatar} accountId={accountId} />
                <Icon className={styles.icon} type="caret-down" theme="filled" style={caretDownStyle} />
              </a>
            </Dropdown>
            <Divider className={styles.divider} type="vertical" />
          </div>
          <ul className={cs("sys-commands",styles.commands)}>
            <li vb-command="minimize" style={{ backgroundImage: `url(${winMin})` }}>
              <i className={cs("fa fa-window-minimize",styles.minimize)}  />
            </li>
            <li vb-command="maximize" style={{ backgroundImage: `url(${winMax})` }}>
              <i className={cs("fa fa-window-maximize",styles.maximize)} />
            </li>
            {
              inTaskWatchPage?(
                <li>
                  <i className={cs("fa fa-close",styles.close)} />
                </li>
              ):(
                <li vb-command="close" style={{ backgroundImage: `url(${winClose})` }}>
                  <i className={cs("fa fa-close",styles.close)} />
                </li>
              )
            }
          </ul>
        </div>
        <div className={styles.content}>
          {accountId && children}
        </div>
      </div>
    );
  }
}

export default CheckLayout;
