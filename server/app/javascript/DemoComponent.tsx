console.info('Loading: server/app/javascript/DemoComponent.tsx')

import React from 'react';
import { createRoot } from 'react-dom/client';
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
  createRoot(document.querySelector('.placeholder-DemoComponent'))
    .render(DemoComponent())
})
