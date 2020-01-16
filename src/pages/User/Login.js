import React, { Component } from 'react';
import { connect } from 'dva';
import Login from '@/components/Login';
import styles from './Login.less';
import IconButton from '@/components/IconButton';

const { Password, Mobile, Submit } = Login;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
class LoginPage extends Component {

  state = {
    type: 'ROLE_ACCT',
    identityCode: 'ID_TEACHER', //默认身份
    checkCode: false, //拖动验证
    submitCount: 0,
    autoLogin: true,
  };

  handleSubmit = (err, values) => {
     const { dispatch } = this.props;
    if (!err ) {
      dispatch({
        type: 'login/login',
        payload: {
          ...values,
          formdata: 'true',
          authenticationType: 'ROLE_ACCT',
          identityCode: 'ID_SPECIALIST',
          client: 'pc',
        },
      })
    }
  };

  render() {
    const { login, submitting } = this.props;
    const { type, autoLogin } = this.state;
    return (
      <div className="mainLogin">
        <Login
          onSubmit={this.handleSubmit}
          validateFirst
          ref={form => {
            this.loginForm = form;
          }}
        >
          <Mobile name="mobile" />
          <Password
            name="password"
            className="passwordInput"
            onPressEnter={() => this.loginForm.validateFields(this.handleSubmit)}
          />
          <Submit loading={submitting} className="newLogin">
            {!submitting&&<IconButton iconName="icon-arrow-half-right" text="" className="toLogin" />}
          </Submit>
        </Login>
      </div>
    );
  }
}

export default LoginPage;
