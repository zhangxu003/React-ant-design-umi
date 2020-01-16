// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority(str) {
  // return localStorage.getItem('antd-pro-authority') || ['admin', 'user'];
  const authorityString =
    typeof str === 'undefined' ? localStorage.getItem('antd-pro-authority') : str;
  // authorityString could be admin, "admin", ["admin"]
  let authority;
  try {
    authority = JSON.parse(authorityString);
  } catch (e) {
    authority = authorityString;
  }
  if (typeof authority === 'string') {
    return [authority];
  }
  return authority || ['admin'];
}


export function setAuthority(authority,token,teacherId,schoolName,teacherName,campusId,ipAddress,accountId) {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  localStorage.setItem('access_token', token);
  // localStorage.setItem('uid', teacherId);
  localStorage.setItem('uid', accountId);
  localStorage.setItem('schoolName', schoolName);
  localStorage.setItem('teacherName', teacherName);
  localStorage.setItem('campusId', campusId);
  localStorage.setItem('ipAddress', ipAddress);
  return localStorage.setItem('antd-pro-authority', JSON.stringify(proAuthority));
}
