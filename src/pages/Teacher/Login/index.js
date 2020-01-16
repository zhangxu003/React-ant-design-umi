import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { message, Layout } from 'antd';
import Login from '@/components/Login';
import styles from './index.less';
import IconButton from '@/components/IconButton';

const { Password, Mobile, Submit } = Login;

@connect(({ vbClient, loading }) => ({
  submitting : loading.effects['login/login'],
  campusId   : vbClient.campusId,
  ipAddress  : `teacher_${vbClient.ipAddress}`
}))
class LoginPage extends Component {

  handleSubmit = (err, values) => {
    const { dispatch,campusId,ipAddress } = this.props;
    if (!err ) {
      const { mobile, password } = values;
      dispatch({
        type: 'login/login',
        payload: {
          mobile : mobile.replace(/(^\s*)|(\s*$)/g, ""),
          password,
          formdata: 'true',
          authenticationType: 'ROLE_ACCT',
          identityCode: 'ID_TEACHER',
          client: 'proxy',
          campusId,
          ipAddress,
        },
      });
    }else{
      const { mobile : mobileVal = "", password : passwordVal = "" } = values;
      // 错误提示内容自定义显示
      const { mobile, password } = err;
      let tag = "";
      if( mobileVal.trim()==="" && passwordVal==="" ){
        tag = formatMessage({id:"task.text.input.username.and.password",defaultMessage:"请输入账号与密码！"});
      }else if( mobile && mobile.errors.length>0 ){
        // 根据消息显示
        tag = mobile.errors[0].message;
      }else if(password && password.errors.length>0){
        tag = password.errors[0].message;
      }
      message.warn(tag,1.5);
    }
  };

  render() {
    const { submitting } = this.props;
    return (
      <Layout className={styles.teacher_page}>
        <div className={styles.checkStatus}>
          <img src='http://res.gaocloud.local/logos/login_page_logo@2x.png' width="540" height="50" alt="" />
        </div>
        <div className="mainLogin">
          <Login
            onSubmit={this.handleSubmit}
            ref={form => {
              this.loginForm = form;
            }}
          >
            <Mobile name="mobile" onPressEnter={() => this.loginForm.validateFields(this.handleSubmit)} />
            <Password
              name="password"
              className="passwordInput"
              onPressEnter={() => this.loginForm.validateFields(this.handleSubmit)}
            />
            <Submit loading={submitting} className="newLogin">
              {!submitting && (
                <IconButton iconName="icon-arrow-half-right" text="" className="toLogin" />
              )}
            </Submit>
          </Login>
        </div>
      </Layout>
    );
  }
}

export default LoginPage;
