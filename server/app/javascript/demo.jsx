import React from 'react';
import ReactDOM from 'react-dom';
import {Lexicon, EditWrapper, VERSION} from '@nitidbit/lexicon';
import './demoStyles.scss';

let lexicon = new Lexicon(
  require('../views/welcome/demo.json'), 'en',
             'views/welcome/demo.json');

function AuthenticationStatus() {
  return (
    <div className="AuthenticationStatus">
      <div>JWT authentication:
        { sessionStorage.hasOwnProperty('lexiconServerToken') ? " SIGNED IN" : " SIGNED OUT" }
      </div>
    </div>);
}

let DemoComponent = ({lexicon}) => (
  <div className="DemoComponent" >
    <h2> { lexicon.get('title') } </h2>
    <p> { lexicon.get('description') } </p>
    <p> { lexicon.get('array_of_strings.intro') } </p>
    <ul>
      { lexicon.get('array_of_strings.items').map( dialect => (<li key={dialect}> { dialect } </li>) ) }
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
        component={DemoComponent}
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
        component={DemoComponent}
        apiUpdateUrl="/update"
      />
    </div>
  );
}

function PigLatinDemo() {
  return (
    <div>
      <EditWrapper
        lexicon={lexicon.locale('pg').subset('PigLatinDemo')}
        component={DemoComponent}
        apiUpdateUrl="/update"
      />
    </div>
  );
}

function replacePlaceholders(selector, component) {
  document.querySelectorAll(selector).forEach(placeholder => {
    ReactDOM.render(React.createElement(component), placeholder);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  replacePlaceholders('.CookieAuthenticatedDemo', CookieAuthenticatedDemo);
  replacePlaceholders('.JwtAuthenticatedDemo', JwtAuthenticatedDemo);
  replacePlaceholders('.PigLatinDemo', PigLatinDemo);
  replacePlaceholders('.LexiconJsVersion', LexiconJsVersion);
});

