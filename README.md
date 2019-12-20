lexicon
=======

Client-side code and React components for interacting with a Lexicon.

- `Lexicon` — a container for your translated strings and data.
- `EditWrapper` — a React component that adds an "Edit Content" button which allows users to edit strings and data.

Installation
------------
    yarn add git+ssh://git@github.com/nitidbit/lexicon.git
    npm i -S git+ssh://git@github.com/nitidbit/lexicon.git

Usage
-----

```ts
import { Lexicon, EditWrapper } from 'lexicon';
import myStrings from './MyStrings.json';

const myLexicon = new Lexicon(myStrings, 'en', 'app/javascript/components/MyStrings.json');

console.log('Hello', myLexicon.get('salutation'))
```

When you create an `EditWrapper`, you now need to specify the API endpoint it should use to make changes:

```jsx
<EditWrapper
  // other props...
  apiUpdateUrl="https://lexicon-editor.herokuapp.com/lexicon" // or whatever the correct URL is
/>
```

Here is a diagram of how all the pieces of Lexicon fit together

<img src="https://raw.githubusercontent.com/nitidbit/lexicon/master/LexiconComponents.png?token=AACEX3BWLYU4BNRAQXZYNGS6APRCQ"
  style="width: 60%; margin-left: 20%"
/>

Creating a Lexicon
------------------

```ts
import { Lexicon } from 'lexicon';

const lex = new Lexicon({
  en: {
    message: 'Hello, world!',
    subComponent: {
      template: 'There are #{count} widgets.',
    },
    faq: [
      { question: 'What is the meaning of life, the universe, and everything?', answer: '42' },
    ],
  },
  es: {
    message: '¡Hola, mundo!',
    subComponent: {
      template: 'Hay #{count} aparatos.',
    },
    faq: [
      { question: '¿Cuál es el significado de la vida, el universo, y todo?', answer: '42' },
    ],
  },
}, 'sampleLexicon.json', 'en');
```

The Lexicon constructor accepts a dictionary of locales, a default locale, and the filename where it is stored (this only matters for the server).

Accessing data
--------------

Using `lex` from the previous example:

```ts
// using default locale
lex.get('message')                                  // => 'Hello, world!'
// nested keys
lex.get('subComponent.template')                    // => 'There are #{count} widgets.'
// templates
lex.get('subComponent.template', { count: 5 })      // => 'There are 5 widgets.'
// different locale
const spanish = lex.locale('es');
spanish.get('message')                              // => '¡Hola, mundo!'
// subset
const subset = lex.subset('subComponent');
subset.get('template', { count: 6 })                // => 'There are 6 widgets.'
// arrays
lex.get('faq.0.question')                           // => 'What is the meaning of life,
                                                    //     the universe, and everything?'

// modifications (should only be used by the editor)
lex.update('message', 'Hi, world!')                 // => true (key exists)
lex.update('key that does not exist', 'blah')       // => false
// optionally specify locale
lex.update('message', '¡Buenos días, mundo!', 'es') // => true
lex.get('message') // => 'Hi, world!'
spanish.get('message') // => 'Buenos días, mundo!'

// other methods and properties
lex.defaultLocale                                   // => 'en'
spanish.defaultLocale                               // => 'es'
lex.locales()                                       // => ['en', 'es']
lex.keys()                                          // => ['message', 'subComponent.template',
                                                    //     'faq.0.question', 'faq.0.answer']

const clone = lex.clone();
clone.update('subComponent.template', 'There are #{count} gadgets.');
// modifications to clone do not affect original
clone.get('subComponent.template')                  // => 'There are #{count} gadgets.'
lex.get('subComponent.template')                    // => 'There are #{count} widgets.'
```

Developing the Lexicon NPM Package
----------------------------------

If you are just using Lexicon in your project, ignore this section.

### Editing Lexicon and your project at the same time
Create a symbolic link from your projects folder to your lexicon folder
    cd myproject
    rm -rf node_modules/lexicon
    ln -s /Users/my-home/path/to/lexicon node_modules/lexicon

Check it worked:
    ls -l node_modules |grep lexicon
should output this which shows it's a symbolic link:
    lrwxr-xr-x    1 winstonw  staff     44 Dec 11 11:40 lexicon@ -> /Users/winstonw/clients/nitidbit/git/lexicon

### Compilation

While developing, run tsc in the background, watching your changes and recompiling

    npm run watch

You should also make sure that all tests pass:

    npm test

Tests are in `src/Lexicon.test.ts`.

### Deploying new versions
Let's use [semantic versioning](https://semver.org).
MAJOR version when you make incompatible API changes,
MINOR version when you add functionality in a backwards compatible manner, and
PATCH version when you make backwards compatible bug fixes.

When Lexicon is in a good state, mark a new version with:

    change src/index.ts > VERSION

Right before you check-in, Build the JS ouput before you commit to GitHub, so it's available to
people using the package. This is already done if you've been running `npm run watch`

    npm run tsc
    git tag <major>.<minor>.<patch>
    git push origin <major>.<minor>.<patch>


Thoughts
--------

### Motivation -- We want:

Clients can:
- edit content for their apps without involving a developer.
- manipulate lists of content, i.e. add, remove, or rearrange elements.
- see their changes in-place. I.e. They don't need to change a string, save, wait 10
  minutes for Heroku to rebuild, and then see the results. The cycle is too long. But after their
  edits, a 10 minute Heroku build to publish them is OK.

Developers can:
- organize string files however makes sense for the project, e.g. one big file for
  everything, or one string file per code file.
- use Lexicon in Ruby, HAML, or JS
- include lists of content, e.g. a list of FAQs which the client can manipulate


### Later

- Editor can check types of content, e.g. must be a number, date, or list has elements of a
  particular shape {question: ___, answer: ___}

