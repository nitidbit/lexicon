console.info('Loading: server/app/javascript/DemoComponent.tsx')

import React from 'react';
import ReactDOM from 'react-dom';
import demoStrings from './DemoComponent.json';

console.log('demoStrings', demoStrings)

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
