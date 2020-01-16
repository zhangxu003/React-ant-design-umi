import { getPremissionVersion, getPremissionList, getStandardList } from '@/services/teacher';
/**
 * 版本权限相关列表
 */
const defaultPermissionList = {
  V_SINGLE_CLASS_EXAM: false, // 本班考试
  V_CLASSROOM_EXERCISES: false, // 课堂练习
  V_MULTI_CLASS_EXAM: false, // 多班联考
  V_CLASS_AFTER_TRAINING: false, // 课后训练
  V_SPECIAL_TRAINING: false, // 专项训练
  V_SCHOOL_EXAM: false, // 校级统考
  V_UNITED_EXAM: true, // 区级统考
  V_CLASSROOM_REVIEW: false, // 课堂讲评
  V_FREEDOM_TRAINING: false, // 自主训练
  V_ANSWER_DETAIL: false, // 答题详情
  V_CUSTOM_PAPER: false, // 自由组卷
  V_ANSWER_ANALYSIS: false, // 答案解析
};

/**
 * 补全返回的权限列表
 * 由于后端值返回，开启的权限，而不显示全部权限，
 * 故补全权限
 * @param {Array} list
 */
const completePremiss = list => {
  const dataCode = list.map(item => item.code);
  return Object.keys(defaultPermissionList).reduce(
    (curr, item) => ({
      ...curr,
      [item]: dataCode.includes(item),
    }),
    {}
  );
};

export default {
  namespace: 'permission',

  state: {
    tenantAuthorizeMode: 'RETAIL', // 授权模式： RETAIL：机房版（默认）； VOL：校园版
    subAuthType: 'STANDARD', // 子授权模式  STANDARD：标准版（默认） ； PROFESSIONAL :专业版
    ...defaultPermissionList,
    standardList: {}, // 标准版权限对象
    professionalList: {}, // 专业版权限对象
  },

  effects: {
    /**
     * [API]AUTH-418：获取校区授权版本
     * [API]PROXY-121：获取校区授权版本
     */
    *getPremissionVersion(_, { call, put, select }) {
      try {
        const { campusId } = yield select(state => state.vbClient);
        if (!campusId) return;
        const { data } = yield call(getPremissionVersion, { campusId });
        const { tenantAuthorizeMode = 'RETAIL', subAuthType = 'STANDARD' } = data;
        yield put({
          type: 'updateState',
          payload: {
            tenantAuthorizeMode,
            subAuthType,
          },
        });
        if (localStorage.getItem('access_token')) {
          yield put.resolve({ type: 'initPremission' });
        }
      } catch (e) {
        console.log(e);
      }
    },

    /**
     * 请求权限的版本 标准版 | 专业版
     * [API]AUTH-400：获取校区的版本功能清单
     * [API]PROXY-119：获取校区的版本功能清单
     * @param {*} param1
     */
    *getPremissionList(_, { put, call, select }) {
      try {
        const { campusId, applicationId } = yield select(state => state.vbClient);
        if (!campusId || !applicationId) return;
        const { data } = yield call(getPremissionList, { campusId, applicationId });
        const dataCode = data.map(item => item.code);
        const listObj = Object.keys(defaultPermissionList).reduce(
          (curr, item) => ({
            ...curr,
            [item]: dataCode.includes(item),
          }),
          {}
        );
        yield put({
          type: 'updateState',
          payload: {
            ...listObj,
          },
        });
      } catch (e) {
        // TODO
      }
    },

    /**
     * 初始化权限功能
     * @param {*} param0
     * @param {*} param1
     */
    *initPremission(_, { select, call, put }) {
      try {
        const { applicationId } = yield select(state => state.vbClient);
        const { tenantAuthorizeMode, subAuthType } = yield select(state => state.permission);
        const list = yield call(getStandardList, { applicationId });
        // tenantAuthorizeMode = 'RETAIL';
        // subAuthType = 'STANDARD';
        // 标准版的权限列表
        const { resourceList: standard = [] } =
          list.data.find(item => item.authTypeName === 'RETAIL-STANDARD') || {};

        // 专业版的权限列表
        const { resourceList: professional = [] } =
          list.data.find(item => item.authTypeName === 'RETAIL-PROFESSIONAL') || {};

        // 当前用户的权限列表
        const currType =
          tenantAuthorizeMode === 'RETAIL'
            ? `${tenantAuthorizeMode}-${subAuthType}`
            : tenantAuthorizeMode;
        const { resourceList: currentList = [] } =
          list.data.find(item => item.authTypeName === currType) || {};

        yield put({
          type: 'updateState',
          payload: {
            ...completePremiss(currentList),
            standardList: completePremiss(standard),
            professionalList: completePremiss(professional),
          },
        });

        // 各个权限列表不全
      } catch (e) {
        // TODO
      }
    },

    /**
     * 打开提示弹框
     */
    *open({ payload }, { put }) {
      yield put({
        type: 'popup/open',
        payload: 'permission',
        data: payload,
      });
    },

    /**
     * 关闭提示弹框
     */
    *close(_, { put }) {
      yield put({
        type: 'popup/close',
        payload: 'permission',
      });
    },
  },

  reducers: {
    // 更新 modal state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
