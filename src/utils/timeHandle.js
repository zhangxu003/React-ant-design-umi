import { formatMessage } from 'umi/locale';
/**
 * 时间的统一处理
 */


/**
 * 页面上的time 显示
 * 分有几位显示几位，不补零，如： 1分10秒
 * 秒统一为两位，如不够，补零，如： 2分01秒
 * 60秒以内，显示为： **秒
 * 大于 60 秒   小于一个小时，显示为： **分**秒
 * 大于 一小时，  显示为： **分**秒，如：61分54秒
 * 计时器格式： mm：ss，如：100：00
 * @param {Number} time
 * @param {String} type "s" time 是秒数  "ms" time 是毫秒 默认 s
 */
export const showTime = (time,type="s")=>{
  let tag = time;
  // const hover  = formatMessage({id:"app.hover",defaultMessage:"时"})
  const minute = formatMessage({id:"app.minute",defaultMessage:"分"});
  const second = formatMessage({id:"app.second",defaultMessage:"秒"});

  if( typeof time !== 'number' || Number.isNaN(Number(time)) ){
    return `00${minute}00${second}`;
  }

  if( type === "ms" ){
    tag = parseInt(time/1000,10);
  }
  // 小于 60 秒
  if( tag < 60 ){
    return `${String(tag).padStart(2,'0')}${second}`;
  }

  // 大于60秒，
  if( tag >= 60 ){
    const minutes = parseInt(tag/60,10);
    const seconds = parseInt(tag%60,10);
    return `${minutes}${minute}${String(seconds).padStart(2,'0')}${second}`;
  }

  // 大于1小时
  // if( tag >= 3600 ){
  //   const minutesAll = parseInt(tag/60,10);
  //   const seconds =    parseInt(tag%60,10);
  //   const hours   =    parseInt(minutesAll/60,10);
  //   const minutes =    parseInt(minutesAll%60,10);
  //   return `${hours}${hover}${String(minutes).padStart(2,'0')}${minute}${String(seconds).padStart(2,'0')}${second}`;
  // }

  return `00${minute}00${second}`;
}

/**
 * 显示的计时器）
 * @param {Number} time  单位秒
 */
export const countDown = (time=0)=>{
  let second = time;
  if( typeof time !== 'number' || Number.isNaN(Number(time)) ){
    second=0;
  }
  const minutes = parseInt(second/60,10);
  const seconds = parseInt(second%60,10);
  return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

