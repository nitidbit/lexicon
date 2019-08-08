Documentation
=============

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
lex.asObject()                                      // => same object passed into constructor

const clone = lex.clone();
clone.update('subComponent.template', 'There are #{count} gadgets.');
// modifications to clone do not affect original
clone.get('subComponent.template')                  // => 'There are #{count} gadgets.'
lex.get('subComponent.template')                    // => 'There are #{count} widgets.'
```
