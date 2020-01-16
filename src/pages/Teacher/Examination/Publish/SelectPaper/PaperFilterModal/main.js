import React from 'react';
import ReactDom from 'react-dom';
import PaperFilterModal from './index';
export default function FilterPaper({dataSource,callback}){
    let func = () => {
        let element = document.getElementById('paperFilter');
        if (element) element.parentNode.removeChild(element);
      };
    
      let divModal = document.createElement('div');
      divModal.id = 'paperFilter';
      document.getElementById('root').appendChild(divModal);
      ReactDom.render(
        <PaperFilterModal dataSource={dataSource} callback={callback} onClose={func}/>,
        document.getElementById('paperFilter')
      );
}