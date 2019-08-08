lexicon
=======

Client-side code and React components for interacting with a Lexicon.

## Installation

With yarn:

```sh
$ yarn add git+ssh://git@github.com/nitidbit/lexicon.git
```

With npm:

```sh
$ npm i -S git+ssh://git@github.com/nitidbit/lexicon.git
```

## Usage

Everything that was exported from different files (`Lexicon.ts`, `EditWrapper.tsx`, etc.) is now available from the package. This shows all the things you can import (real usage will probably not need them all):

```ts
import {
  Lexicon,
  EditWrapper,
} from 'lexicon';
```

When you create an `EditWrapper`, you now need to specify the API endpoint it should use to make changes:

```jsx
<EditWrapper
  // other props...
  apiUpdateUrl="https://lexicon-editor.herokuapp.com/lexicon" // or whatever the correct URL is
/>
```

[See full documentation here.](docs.md)

## Compilation

Build the JS ouput before you commit to GitHub, so it's available to people using the package:

```sh
$ tsc
```

You should also make sure that all tests pass:

```sh
$ npm test
```

Tests are in `src/Lexicon.test.ts`.


## Motivation -- We want:

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

