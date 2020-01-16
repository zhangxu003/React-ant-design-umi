import request from '@/utils/request';

export async function query() {
  return request('/api/users');
}

export async function queryCurrent(teacherId) {
  return request(`/api/paper/specialist/accountId/${teacherId}`);
}
