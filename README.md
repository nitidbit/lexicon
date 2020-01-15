lexicon
=======

Client-side code and React components for interacting with a Lexicon.

- `Lexicon` — a container for your translated strings and data.
- `EditWrapper` — a React component that adds an "Edit Content" button which allows users to edit strings and data.

Installation
------------
    yarn add git+ssh://git@github.com/nitidbit/lexicon.git#2.6.0     # 2.6.0 = the release version
    npm i -S git+ssh://git@github.com/nitidbit/lexicon.git#2.6.0

Usage
-----
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
    subComponent:
      template: 'Hay #{count} aparatos.'
    faq:
      - question: '¿Cuál es el significado de la vida, el universo, y todo?'
        answer: '42'
```
    import { Lexicon, EditWrapper } from 'lexicon';

    const lex = new Lexicon(require('./MyStrings.yml'),        // the data, assuming you have a YAML loader
            'app/javascript/components/MyStrings.yml');        // plus the filename for the editor

    console.log('Hello', myLexicon.get('salutation'))


Get values using nested keys separated by "."

    lex.get('subComponent.template')                    // => 'There are #{count} widgets.'

Optionally substitute variables iinto the fetched string.

    lex.get('subComponent.template', { count: 5 })      // => 'There are 5 widgets.'

Change to different locale

    lex.locale('es').get('message')                              // => '¡Hola, mundo!'

Generate a "subset" of content for passing to a child component

    lex.subset('subComponent').get('template', { count: 6 })  // => 'There are 6 widgets.'

Arrays can be accessed using numeric keys

    lex.get('faq.0.question')                           // => 'What is the meaning of life,
                                                        //     the universe, and everything?'
Change History
--------------
See: [src/index.ts](src/index.ts)

Adding an in-place editor
-------------------------
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

    change package.json > version
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

