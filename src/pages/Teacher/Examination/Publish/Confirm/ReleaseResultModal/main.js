import React from 'react';
import ReactDom from 'react-dom';
import ReleaseResultModal from './index';
export default function ReleaseResultSet({dataSource,callback}){
    let func = () => {
        let element = document.getElementById('ReleaseResult');
        if (element) element.parentNode.removeChild(element);
      };
    
      let divModal = document.createElement('div');
      divModal.id = 'ReleaseResult';
      document.getElementById('root').appendChild(divModal);
      ReactDom.render(
        <ReleaseResultModal dataSource={dataSource} callback={callback} onClose={func}/>,
        document.getElementById('ReleaseResult')
      );
}