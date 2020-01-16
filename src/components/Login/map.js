import React from 'react';
import { Icon } from 'antd';
import { formatMessage } from 'umi/locale';
import styles from './index.less';

export default {
  UserName: ()=>({
    props: {
      size: 'large',
      id: 'userName',
      prefix: <Icon type="user" className={styles.prefixIcon} />,
      placeholder: 'admin',
    },
    rules: [
      {
        required: true,
        message: 'Please enter username!',
      },
    ],
  }),
  Mobile:  ()=>({
    props: {
      size: 'large',
      prefix: <Icon type="user" className={styles.prefixIcon} />,
      placeholder: formatMessage({id:"task.placeholder.teacher.account",defaultMessage:"教师账号(同线上平台账号)"}),
      maxLength : 11
    },
    rules: [
      {
        required: true,
        message: formatMessage({id:"task.message.input.login.account",defaultMessage:"请输入登录账号！"}),
        whitespace : true
      },
      // {
      //   pattern: /^1\d{10}$/,
      //   message: '您输入的账号或密码不正确！',
      //   transform : (val="")=>val.replace(/(^\s*)|(\s*$)/g, ""),
      // }
    ],
  }),
  Password: ()=>({
    props: {
      size: 'large',
      prefix: <Icon type="lock" className={styles.prefixIcon} />,
      type: 'password',
      id: 'password',
      placeholder: formatMessage({id:"task.placeholder.login.password",defaultMessage:"登录密码"}),
      maxLength : 20
    },
    rules: [
      {
        required: true,
        message: formatMessage({id:"task.message.please.input.password",defaultMessage:"请输入密码！"}),
        whitespace : true
      },
      {
        pattern: /^[^\u4e00-\u9fa5]+$/,
        message: formatMessage({id:"task.message.account.or.password.is.error",defaultMessage:"您输入的账号或密码不正确！"}),
      }
    ],
  }),
  Captcha: ()=>({
    props: {
      size: 'large',
      prefix: <Icon type="mail" className={styles.prefixIcon} />,
      placeholder: 'captcha',
    },
    rules: [
      {
        required: true,
        message: 'Please enter Captcha!',
      },
    ],
  })
};
