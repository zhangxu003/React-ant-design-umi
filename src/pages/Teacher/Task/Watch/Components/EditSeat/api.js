import React from 'react';
import ReactDom from 'react-dom';
import EditSeat from './index';

// 修改座位号
export default function showEditSeat({ dataSource, callback }) {
  const func = () => {
    const element = document.getElementById('EditSeat');
    if (element) element.parentNode.removeChild(element);
  };

  const div = document.createElement('div');
  div.id = 'EditSeat';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <EditSeat dataSource={dataSource} callback={callback} onClose={func} />,
    document.getElementById('EditSeat')
  );
}
