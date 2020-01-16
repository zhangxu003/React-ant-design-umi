import React from 'react';
import ReactDom from 'react-dom';
import ExceptionHanding from './index';

// 异常处理
export default function showExceptionHanding({ dataSource, callback }) {
  const func = () => {
    const element = document.getElementById('ExceptionHanding');
    if (element) element.parentNode.removeChild(element);
  };

  const div = document.createElement('div');
  div.id = 'ExceptionHanding';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <ExceptionHanding dataSource={dataSource} callback={callback} onClose={func} />,
    document.getElementById('ExceptionHanding')
  );
}
