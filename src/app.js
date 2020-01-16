export const dva = {
  config: {
    onError(err) {
      // 对api的统一的请求做特殊处理
      if (err.type === 'server' && err.next) {
        err.next();
      }
    },
  },
};

export async function render(oldRender) {
  // 去获取 中文字体库
  if (process.env.NODE_ENV === 'development') {
    window.g_locales = {};
    try {
      const data = await fetch('/downloadI10n', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
        },
        mode: 'cors',
      }).then(response => response.json());
      window.g_locales = data || {};
    } catch (err) {
      console.log('翻译库加载失败！', err);
    }
    oldRender();
  } else {
    if (!window.g_locales) {
      window.g_locales = {};
    }
    oldRender();
  }
}
