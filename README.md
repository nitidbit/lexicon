lexicon
=======

Client-side code and React components for interacting with a Lexicon.

## Installation

```sh
$ # with yarn
$ yarn add git+ssh://git@github.com/nitidbit/lexicon.git
$ # with npm
$ npm install --save git+ssh://git@github.com/nitidbit/lexicon.git
```

## Usage

Everything that was exported from different files (`Lexicon.ts`, `EditWrapper.tsx`, etc.) is now available from the package. This shows all the things you can import (real usage will probably not need them all):

```ts
import {
  Lexicon,
  LexiconShape,
  ShortString,
  LongString,
  FlatShape,
  DottedKey,
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

## Compilation

Build the JS ouput before you commit to Github, so it's available to people using the package:

```sh
$ tsc
```
