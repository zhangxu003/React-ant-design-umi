import React from 'react';
import ReactDom from 'react-dom';
import SetTest from './index';

// 批量添加答案
export default function showSetTest({ dataSource, callback }) {
  const func = () => {
    const element = document.getElementById('SetTest');
    if (element) element.parentNode.removeChild(element);
  };

  const div = document.createElement('div');
  div.id = 'SetTest';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <SetTest dataSource={dataSource} callback={callback} onClose={func} />,
    document.getElementById('SetTest')
  );
}
