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

function CookieAuthenticatedDemo() {
  const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  return (
    <div>

      <AuthenticationStatus/>

      <EditWrapper
        lexicon={lexicon.subset('CookieAuthenticatedDemo')}
        component={BlurbAndList}
        allowEditing={true}
        apiUpdateUrl="/cookie_auth_update"
        extraHeaders={{ 'X-CSRF-Token': token }}
      />
    </div>
  );
}

function JwtAuthenticatedDemo() {
  return (
    <div>
      <EditWrapper
        lexicon={lexicon.subset('JwtAuthenticatedDemo')}
        component={BlurbAndList}
        apiUpdateUrl="http://localhost:3000/update"
      />
    </div>
  );
}

function CorsTester() {
  return (
    <div>
      <EditWrapper
        lexicon={lexicon.subset('CorsTester')}
        component={BlurbAndList}
        apiUpdateUrl="http://localhost:3000/update"
      />
    </div>
  );
}

function replacePlaceholders(selector, component) {
  document.querySelectorAll(selector).forEach(placeholder => {
    ReactDOM.render(React.createElement(component), placeholder);
  });
}

// Install cpmponents when page loads
document.addEventListener('DOMContentLoaded', () => {
  replacePlaceholders('.CookieAuthenticatedDemo', CookieAuthenticatedDemo);
  replacePlaceholders('.JwtAuthenticatedDemo', JwtAuthenticatedDemo);
  replacePlaceholders('.CorsTester', CorsTester);
  replacePlaceholders('.LexiconJsVersion', LexiconJsVersion);
});

