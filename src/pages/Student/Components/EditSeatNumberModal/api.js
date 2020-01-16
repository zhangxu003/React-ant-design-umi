import React from 'react';
import ReactDom from 'react-dom';
import EditSeatNumberModal from './index';

// 添加试卷
export default function showEditSeatNumberModal({ dataSource, callback }) {
  let func = () => {
    let element = document.getElementById('editSeatNumber');
    if (element) element.parentNode.removeChild(element);
  };

  let div = document.createElement('div');
  div.id = 'editSeatNumber';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <EditSeatNumberModal dataSource={dataSource} callback={callback} onClose={func} />,
    document.getElementById('editSeatNumber')
  );
}
