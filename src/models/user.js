import { query as queryUsers, queryCurrent } from '@/services/user';
import { message } from 'antd';

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent({payload}, { call, put }) {
      const response = yield call(queryCurrent,payload);
      // 当前用户信息
      if (response.responseCode === '200') {
        yield put({
          type: 'saveCurrentUser',
          payload: response && response.data,
        });
      } else {
        message.warning(response.data||'很抱歉，服务器超时或身份已过期，请稍后重试！');
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveCurrentUser(state, action) {
      const contentTeamId = action.payload.contentTeamId ? action.payload.contentTeamId : '';
      localStorage.setItem('contentTeamId', contentTeamId);
      const specialistId = action.payload.id ? action.payload.id : '';
      localStorage.setItem('specialistId', specialistId);
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};
