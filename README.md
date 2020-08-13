lexicon
=======

Client-side code and React components for interacting with a Lexicon.

- `Lexicon` — a container for your translated strings and data.
- `EditWrapper` — a React component that adds an "Edit Content" button which allows users to edit strings and data.
- `Lexicon Server` — a Rails app that will accept changes from the editor, and write them to GitHub

[DEVELOPERS.md is documentation for people modifying the Lexicon JS client](DEVELOPERS.md).

[SERVER.md is documentation for the Lexicon-server](SERVER.md)

Installation
------------
set NPM_TOKEN environment var so you can access Nitid's private Github NPM package registry. See 1Password.

Point NPM to use Nitid's registry: create this file:
```
# .npmrc
@nitidbit:registry=https://npm.pkg.github.com/
```

    npm i --save @nitidbit/lexicon

Lexicon
-------
A Lexicon is a container for translated strings and data.

```json
# MyStrings.yml
en:
    message: 'Hello, world!'
    subComponent:
      template: 'There are #{count} widgets.'
    faq:
      - question: 'What is the meaning of life, the universe, and everything?'
        answer: '42'
es:
    message: '¡Hola, mundo!',
    ...
```
    import { Lexicon, EditWrapper } from 'lexicon';

    const lex = new Lexicon(require('./MyStrings.yml'), 'en',  // the data, assuming you have a YAML loader
            'app/javascript/components/MyStrings.yml');        // plus the filename for the editor

Get values using key paths as arrays or separated by "."

    lex.get(['subComponent', 'template'])               // => 'There are #{count} widgets.'
    lex.get('subComponent.template')                    // => 'There are #{count} widgets.'

Optionally interpolate variables into the fetched string.

    lex.get('subComponent.template', { count: 5 })      // => 'There are 5 widgets.'

Change to different locale

    lex.locale('es').get('message')                              // => '¡Hola, mundo!'

Generate a "subset" of content for passing to a child component

    lex.subset('subComponent').get('template', { count: 6 })  // => 'There are 6 widgets.'

Arrays can be accessed using numeric keys

    lex.get('faq.0.question')                           // => 'What is the meaning of life,
                                                        //     the universe, and everything?'
EditWrapper
-----------
EditWrapper is a React component that takes your component, and a Lexicon and adds an Edit Contents button. Admins can then edit a Lexicon, see changes live, and then save them to a Lexicon-Server.

When you create an `EditWrapper`, you now need to tell it where to send changes. There are several configurations:

- An **endpoint on your own Rails app** that will call [Services::LexiconSaver](https://github.com/nitidbit/lexicon-server/blob/master/app/services/lexicon_saver.rb) Take a look at how Bedsider does it. Generally you'll add an endpoint which forwards params to LexiconSaver.

- Use the endpoint on **[ Nitid's Lexicon Server ](http://lexicon-server-staging.herokuapp.com/)**.  — See the [Lexicon Server README](https://github.com/nitidbit/lexicon-server/blob/master/README.md) about how to add your app.

```jsx
<EditWrapper
  // other props...
  apiUpdateUrl="https://lexicon-editor.herokuapp.com/update" // or whatever the correct URL is
/>
```

[Here is a diagram of how all the pieces of Lexicon fit together](LexiconComponents.png)


Where are we using Lexicon and Lexicon-Server?
----------------------------------------------

### Lexicon cient only
- www.bedsider.org
  - uses internal editor

### Lexicon Server

- https://use.mybirthcontrol.org
  clients: Whitney
  repo: https://github.com/nitidbit/mybcweb
  - [MyBC disemination site](http://mybcweb.s3-website-us-west-2.amazonaws.com/)
  - uses server: http://lexicon-editor.herokuapp.com

- [MyPath disemination site](http://mypathweb.s3-website.us-east-2.amazonaws.com/)
  info.mypath.org -- no production site yet
  http://mypathweb.s3-website.us-east-2.amazonaws.com/
  clients: Sam
  repo: https://github.com/nitidbit/mypathweb

- HIV tool -- no production site yet
  https://staging.myhivprevention.org
  clients: Whitney
  repo: hiv-dst
    - [HIV DST](http://hiv-dst.herokuapp.com/)

    - [MyBC Peripartum disemination site](http://mybcweb-pp.s3-website-us-west-2.amazonaws.com/)


Change History
--------------
See: [src/index.ts](src/index.ts)



