import { Modal, message } from 'antd';
import { formatMessage } from 'umi/locale';
import { G2, setTheme } from 'bizcharts';
import { BizChartColors } from '@/utils/color';

// bizcharts 全局颜色配置
setTheme({
  colors: BizChartColors,
  colors_16: BizChartColors,
  colors_24: BizChartColors,
  colors_pie: BizChartColors,
  colors_pie_16: BizChartColors,
});

// 禁止G2请求 额外的地址
G2.track(false);

// 重新定义 console 日志处理（ 方便处理系统日志 ）
// const oldConsole = window.console;
// window.console = new Proxy({},{
//   get( target, key ){
//     if( key in oldConsole ){
//       return (...params)=>{
//         const log = sessionStorage.getItem(`log_${key}`);
//         sessionStorage.setItem(`log_${key}`,`${log}${JSON.stringify(params)}`)
//         oldConsole[key](...params);
//       }
//     }
//     throw new Error("异常日志")
//   }
// })

// message统一设置
message.config({
  top: 20,
  duration: 2,
  maxCount: 3,
});

// Notify user if offline now
window.addEventListener('sw.offline', () => {
  message.warning(formatMessage({ id: 'app.pwa.offline' }));
});

// Pop up a prompt on the page asking the user if they want to use the latest version
window.addEventListener('sw.updated', e => {
  Modal.confirm({
    title: formatMessage({ id: 'app.pwa.serviceworker.updated' }),
    content: formatMessage({ id: 'app.pwa.serviceworker.updated.hint' }),
    okText: formatMessage({ id: 'app.pwa.serviceworker.updated.ok' }),
    onOk: async () => {
      // Check if there is sw whose state is waiting in ServiceWorkerRegistration
      // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration
      const worker = e.detail && e.detail.waiting;
      if (!worker) {
        return Promise.resolve();
      }
      // Send skip-waiting event to waiting SW with MessageChannel
      await new Promise((resolve, reject) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = event => {
          if (event.data.error) {
            reject(event.data.error);
          } else {
            resolve(event.data);
          }
        };
        worker.postMessage({ type: 'skip-waiting' }, [channel.port2]);
      });
      // Refresh current page to use the updated HTML and other assets after SW has skiped waiting
      window.location.reload(true);
      return true;
    },
  });
});

window.paperUrl = 'http://res.gaocloud.local';

// 如果浏览器支持requestAnimFrame则使用requestAnimFrame否则使用setTimeout
window.requestAnimFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  (callback => window.setTimeout(callback, 1000 / 60));

// 取消动画时间
window.cancelAnimationFrame =
  window.cancelAnimationFrame ||
  window.webkitCancelAnimationFrame ||
  window.mozCancelAnimationFrame ||
  window.clearTimeout;

// const ws = new WebSocket("ws://10.17.9.26:8000/ws/",'browser.sdfasdfasdf');
// ws.onopen = function()
// {
//   console.log(1111111111,"==================",ws.readyState);
//    // Web Socket 已连接上，使用 send() 方法发送数据
//    ws.send("发送数据");
// };

// ws.onmessage = function (evt)
// {
//   console.log(222222222222,"==================",ws.readyState);
//    console.log(evt);
// };

// ws.onclose = function(err)
// {
//   console.log(33333333333,"==================",ws.readyState)
//   console.log(err);
// };
