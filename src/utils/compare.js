/**
 * 自定义排序
 * @author tina.zhang
 * @date   2019-05-07
 * @param {string} propName
 * @param {string} sorttype - ascend(默认值)、descend
 */
const compare = (propName, sorttype = 'ascend') => {
  // descend
  if (sorttype === 'descend') {
    return (obj1, obj2) => {
      if (obj1[propName] > obj2[propName]) {
        return -1;
      }
      if (obj1[propName] === obj2[propName]) {
        return 0;
      }
      return 1;
    }
  }
  // ascend
  return (obj1, obj2) => {
    if (obj1[propName] < obj2[propName]) {
      return -1;
    }
    if (obj1[propName] === obj2[propName]) {
      return 0;
    }
    return 1;
  }

};
export default compare;
