import React from 'react';
import ReactDom from 'react-dom';
import Attention from './index';

// 未进入等待考试的学生
export default function showAttention({ dataSource, callback }) {
  const func = () => {
    const element = document.getElementById('showAttention');
    if (element) element.parentNode.removeChild(element);
  };

  const div = document.createElement('div');
  div.id = 'showAttention';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <Attention dataSource={dataSource} callback={callback} onClose={func} />,
    document.getElementById('showAttention')
  );
}
