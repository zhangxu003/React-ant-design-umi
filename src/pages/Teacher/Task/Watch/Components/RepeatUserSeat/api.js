import React from 'react';
import ReactDom from 'react-dom';
import RepeatUserSeat from './index';

// 重复座位号
export default function showRepeatUserSeat({ dataSource, callback }) {
  const func = () => {
    const element = document.getElementById('showRepeatUserSeat');
    if (element) element.parentNode.removeChild(element);
  };

  const div = document.createElement('div');
  div.id = 'showRepeatUserSeat';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <RepeatUserSeat dataSource={dataSource} callback={callback} onClose={func} />,
    document.getElementById('showRepeatUserSeat')
  );
}
