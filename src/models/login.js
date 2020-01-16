import { routerRedux } from 'dva/router';
import router from 'umi/router';
import { fakeAccountLogin } from '@/services/api';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { reloadAuthorized } from '@/utils/Authorized';
import { message } from 'antd';
import { proxyTokenDelete } from '@/services/teacher';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put, select }) {
      const { data, responseCode } = yield call(fakeAccountLogin, payload);

      const { ipAddress } = yield select(state => state.vbClient);
      if (responseCode === '200') {
        const { token, currentCampusId, teacherIdList = [] } = data;
        const username = 'admin';

        // 获取当前校区的teacher 信息
        const currentTeacher = teacherIdList.find(item => item.campusId === currentCampusId);
        const { accountId, name, teacherId } = currentTeacher || teacherIdList[0];
        const teacherList = teacherIdList.map(item => ({
          campusId: item.campusId,
          teacherId: item.teacherId,
        }));

        const accountInfo = {
          access_token: token, // token
          currentAuthority: username, // 当期的角色
          campusId: currentCampusId, // 校区id
          accountId, // 账号的accountid，用于头像
          teacherId: currentTeacher ? teacherId : '', // 只显示，该教师在当期校区的teacherId, 没有的话为空
          teacherName: name, // 老师的名称
          inCurrentCampus: !!currentTeacher, // 老师是否在当期校区
          teacherList, // 教师的列表
          status: responseCode,
          schoolName: '',
          errCode: responseCode,
          ipAddress,
        };

        yield put({
          type: 'changeLoginStatus',
          payload: accountInfo,
        });

        // 缓存的相关信息
        localStorage.setItem('accountInfo', JSON.stringify(accountInfo));

        reloadAuthorized();
        const urlParams = new URL(window.location.href);

        const params = getPageQuery();
        let { redirect } = params;
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = redirect;
            return;
          }
        }
        yield put(routerRedux.replace(redirect || '/teacher'));
        yield put({ type: 'permission/initPremission' });
      } else if (responseCode === '400' || !data) {
        message.warning('账号信息不正确，请检查线上平台的教师账号，重新登录！');
      }
    },

    /**
     * 教师机登出
     * @param {*} _
     * @param {*} param1
     */
    *logout(_, { call, put, select }) {
      const { ipAddress } = yield select(state => state.vbClient);
      yield call(proxyTokenDelete, `teacher_${ipAddress}`);
      yield put({
        type: 'changeLoginStatus',
        payload: {
          access_token: '', // token
          currentAuthority: 'guest', // 当期的角色
          campusId: '', // 校区id
          accountId: '', // 账号的accountid，用于头像
          teacherId: '', // 教师的id
          teacherName: '', // 老师的名称
          inCurrentCampus: '', // 老师是否在当期校区
          teacherList: '', // 教师的列表
          status: false,
          schoolName: '',
          errCode: false,
          ipAddress: '',
        },
      });
      localStorage.removeItem('accountInfo');
      yield put({ type: 'teacher/clearTeacherInfo' });
      yield put({ type: 'teacher/clearTaskCount' });
      // reloadAuthorized();
      router.push('/');
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      const {
        currentAuthority,
        access_token: accessToken,
        teacherId,
        schoolName,
        teacherName,
        campusId,
        ipAddress,
        accountId,
      } = payload;
      setAuthority(
        currentAuthority,
        accessToken,
        teacherId,
        schoolName,
        teacherName,
        campusId,
        ipAddress,
        accountId
      );
      return {
        ...state,
        status: payload,
      };
    },
  },
};
