console.info('Loading: server/app/javascript/testing.jsx')

import React from 'react';
import ReactDOM from 'react-dom';
import {Lexicon, EditWrapper, VERSION} from '@nitidbit/lexicon';
import './testingStyles.scss';

let lexicon = new Lexicon(
  require('../views/welcome/testing.json'), 'en',
             'server/app/views/welcome/testing.json');

function AuthenticationStatus() {
  return (
    <div className="AuthenticationStatus border-solid">
      <div>JWT authentication:
        { sessionStorage.hasOwnProperty('lexiconServerToken') ? " SIGNED IN" : " SIGNED OUT" }
      </div>
    </div>);
}

let BlurbAndList = ({lexicon}) => (
  <div className="BlurbAndList border-solid" >
    <h2> { lexicon.get('title') } </h2>
    <p> { lexicon.get('description') } </p>
    <ul>
      { lexicon.get('array_of_strings').map( dialect => (<li key={dialect}> { dialect } </li>) ) }
    </ul>
  </div>
);

let LexiconJsVersion = () => <span className="LexiconJsVersion"> {VERSION} </span>;

function JwtAuthenticatedDemo({apiUpdateUrl}) {
  console.log('JWT auth demo apiUrlupdate=', apiUpdateUrl)
  return (
    <div>
      <EditWrapper
        lexicon={lexicon.subset('JwtAuthenticatedDemo')}
        component={BlurbAndList}
        apiUpdateUrl={apiUpdateUrl}
      />
    </div>
  );
}

function CorsTester({apiUpdateUrl}) {
  return (
    <div>
      <EditWrapper
        lexicon={lexicon.subset('CorsTester')}
        component={BlurbAndList}
        apiUpdateUrl={apiUpdateUrl}
      />
    </div>
  );
}

/*
   Replace 'selector' with React 'component'. If you want to pass params from Ruby to React,
   you can can add a data-params attribute containg a JSON string. e.g.
        <___ data-params='{"myParam": "myValue"}'>
   will pass 'myParam' to your React component.
*/
function replacePlaceholders(selector, component) {
  document.querySelectorAll(selector).forEach(placeholder => {
    let dataParams = placeholder?.attributes['data-params']?.value
    if (dataParams) {
      dataParams = JSON.parse(dataParams)
    } else {
      dataParams = {}
    }
    ReactDOM.render(React.createElement(component, dataParams), placeholder);
  });
}

// Install cpmponents when page loads
document.addEventListener('DOMContentLoaded', () => {
  replacePlaceholders('.JwtAuthenticatedDemo', JwtAuthenticatedDemo);
  replacePlaceholders('.CorsTester', CorsTester);
  replacePlaceholders('.LexiconJsVersion', LexiconJsVersion);
});

