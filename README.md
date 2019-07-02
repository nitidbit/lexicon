lexicon
=======

Client-side code and React components for interacting with a Lexicon.

## Compilation

Build the JS ouput before you commit to Github, so it's available to people using the package:

```
$ tsc
```

## Usage

Everything that was exported from different files (`Lexicon.ts`, `EditWrapper.tsx`, etc.) is now available from the package. This shows all the things you can import:

```ts
import { Lexicon, LexiconShape, ShortString, LongString, FlatShape, DottedKey, EditWrapper } from 'lexicon';
```
