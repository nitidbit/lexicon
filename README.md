lexicon
=======

Client-side code and React components for interacting with a Lexicon.

- `Lexicon` — a container for your translated strings and data.
- `LxProvider` — a React component that adds an "Edit Content" button which allows users to edit strings and data.
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

Add Lexicon to your project, e.g.
``` typescript
// LxEditPanelExample.tsx

import React from "react"
import { useLexicon, LxProvider } from '@nitidbit/lexicon'
import demoStrings from "./DemoComponent.json" // Your text content

const UPDATE_URL = "https://lexicon.nitid.co/update"

// <LxProvider> provides storage and the editor for Lexicon data
export function ExampleApp() {
  return (
    <div className="ExampleApp">
      <LxProvider apiUpdateUrl={ UPDATE_URL }>
        <ExampleComponent/>
      </LxProvider>
    </div>
  )
}

// useLexicon() returns a Lexicon instance for fetching your text content. See next section for what
// a Lexicon can do.
function ExampleComponent({}) {
  const demoLexicon = useLexicon(demoStrings) // instantiate a Lexicon with our strings
  return (
    <div className="ExampleComponent">
      { demoLexicon.get('title', {appName: 'blah'} ) } // retrieve the localized 'title', and insert 'appName'
    </div>
  )
}
```
``` json
{
  "repoPath": "server/app/javascript/DemoComponent.json",
  "en": {
    "title": "React Demo Component for #{appName}",
  },
  "es": {
    "title": "Spanish React Demo page for #{appName}",
  }
}
```


Lexicon
-------
A Lexicon is a container for translated strings and data.

```json
{
  "en": {
    "message": "Hello, world!"
    "subComponent": {
      "template": "There are #{count} widgets."
    }
    "faq": {
       "question": "What is the meaning of life, the universe, and everything?"
       "answer": "42"
    },
  "es": {
    "message": "¡Hola, mundo!"
  }
}
```
    import { Lexicon, EditWrapper } from 'lexicon';

    const lex = new Lexicon(require('./MyStrings.yml'))  // the data, assuming you have a YAML loader
                                                         // plus the filename for the editor

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

One lexicons can added as a branch of another so that values from both are accessible

      lex1 = new Lexicon({repoPath: 'lex1.json', en: { one: 'ONE' }});
      lex2 = new Lexicon({repoPath: 'lex2.json', en: { two: 'TWO' }});

      lex1.addBranch(lex2, 'added');
      lex1.get('one')                                   // => 'ONE'
      lex1.get('added.two')                             // => 'TWO'

[Here is a diagram of how all the pieces of Lexicon fit together](LexiconComponents.png)


Slack alerts when someone saves edits
-------------------------------------
A ClientApp can be configured to send a slack message when changes are saved to Git.

Make a Slack Incoming Webhook
  - go to Slack > (your workspace) > Tool & settings > Manage Apps > Custom Integrations
  - Find or add the "Incoming Webhooks" integration. (Yes it's deprecated but still works as of 2024)
  - Configure it to post to one of your channels
  - At the end of the workflow, you'll have a "Webhook URL"
Add the Slack Workflow URL to LexiconServer
  - As an admin, Go to lexicon server
  - admin > client apps > edit the app
  - Set "Slack Workflow Url" to the Webhook URL from above
Verify it works
  - Make a small edit
  - See the message appear in Slack. It should be something like:
    User "___@example.com" on app https://myapp.com/myapp has changed Lexicon text:
      "en.faq.0.answer" has changed to "___"


Where are we using Lexicon and Lexicon-Server?
----------------------------------------------

- www.bedsider.org - uses internal server, i.e. edits are posted to bedsider/lexicon/update

- https://lexicon.nitid.co/admin
    Several static sites uses this server for making Lexicon changes.

- MyBC and MyPath


Change History
--------------
See: [src/index.ts](src/index.ts)
