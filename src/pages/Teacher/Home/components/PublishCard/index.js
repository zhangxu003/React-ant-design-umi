import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import IconButton from '@/frontlib/components/IconButton';
import styles from './index.less';
import iconPro from '@/assets/icon_pro.png';

@connect(({ permission, loading }) => {
  const {
    V_SINGLE_CLASS_EXAM,
    V_MULTI_CLASS_EXAM,
    V_CLASSROOM_EXERCISES,
    V_SPECIAL_TRAINING,
    V_UNITED_EXAM,
  } = permission;
  return {
    permissionList: {
      V_SINGLE_CLASS_EXAM,
      V_MULTI_CLASS_EXAM,
      V_CLASSROOM_EXERCISES,
      V_SPECIAL_TRAINING,
      V_UNITED_EXAM,
    },
    loading: loading.effects['permission/initPremission'],
  };
})
class PublishCard extends PureComponent {
  onClick = () => {
    const { data, dispatch, permissionList } = this.props;
    const { code, permissionCode } = data;
    // 权限判断写入
    if (!permissionList[permissionCode]) {
      // 如果没有权限跳转到一个弹出框上
      dispatch({
        type: 'permission/open',
        payload: permissionCode,
      });
      return;
    }
    if (code === 'TT_6') {
      router.push(`/teacher/districtList/${code}`);
    } else {
      router.push(`/teacher/tasklist/${code}`);
    }
  };

  render() {
    const { data, style, permissionList, loading } = this.props;
    const { img: imgUrl, permissionCode } = data;
    const rule = permissionList[permissionCode];

    return (
      <div className={styles.card} style={style}>
        <div className={styles.topimg}>
          <img src={imgUrl} alt="" />
        </div>
        <div className={styles.title}>{data.title}</div>
        <div className={styles.tips}>{data.tip}</div>
        <div className={styles.contentCard}>
          <div className={styles.flex}>
            <div className={styles.dot} />
            <div className={styles.normal}>{data.content[0]}</div>
          </div>
          <div className={styles.flex}>
            <div className={styles.dot} />
            <div className={styles.normal}>{data.content[1]}</div>
          </div>
          <div className={styles.flex}>
            <div className={styles.dot} />
            <div className={styles.normal}>{data.content[2]}</div>
          </div>
        </div>
        <div className={styles.flex}>
          {data.isuse ? (
            <IconButton
              iconName="icon-arrow-half-right"
              className={styles.publish}
              textColor="textColor"
              text={formatMessage({ id: 'task.button.enter', defaultMessage: '进入' })}
              onClick={this.onClick}
              tag={!rule && !loading ? <img src={iconPro} alt="" /> : null}
            />
          ) : (
            <div className={styles.disablebtn}>
              {formatMessage({ id: 'task.message.coming.soon', defaultMessage: '敬请期待' })}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default PublishCard;
