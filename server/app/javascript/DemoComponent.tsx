console.info('Loading: server/app/javascript/demo.tsx')

import React from 'react';
import ReactDOM from 'react-dom';

function DemoComponent() {
  return (
    <div className="DemoComponent">
      Demo App
    </div>
  )
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    React.createElement(DemoComponent),
    document.querySelector('.placeholder-DemoComponent'));
})
