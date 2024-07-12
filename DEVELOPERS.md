Read-Me for Developers working on Lexicon itself
================================================

Github package registry:
- https://github.com/nitidbit/lexicon/pkgs/npm/lexicon


Developing the Lexicon NPM Package
----------------------------------

If you are just using Lexicon in your project, you can ignore this file.

### Editing Lexicon and your project at the same time
Create a symbolic link from your projects folder to your lexicon folder

    cd myproject
    rm -rf node_modules/@nitidbit/lexicon
    ln -s /Users/my-home/path/to/lexicon node_modules/@nitidbit/lexicon

Check it worked:

    ls -l node_modules |grep lexicon

should output this which shows it's a symbolic link:

    lrwxr-xr-x    1 winstonw  staff     44 Dec 11 11:40 lexicon@ -> /Users/winstonw/clients/nitidbit/git/lexicon

### Compilation

While developing, run tsc in the background, watching your changes and recompiling
    npm i
    npm run build:watch

You should also make sure that all tests pass:

    npm test

Tests are in `src/Lexicon.test.ts`.

### Deploying new versions

Let's use [semantic versioning](https://semver.org).
MAJOR version when you make incompatible API changes,
MINOR version when you add functionality in a backwards compatible manner, and
PATCH version when you make backwards compatible bug fixes.

When Lexicon is in a good state, set new version number:

    - npm-package/src/index.ts
    - npm-package/package.json

First time: Login NPM into Github's package registry.

    Create a new GitHub personal access token at https://github.com/settings/tokens
     Your token must have the `repo` and read:packages` scopes to login to the GitHub Package Registry.
    npm login --registry=https://npm.pkg.github.com/
    Use the token as a password

Right before you `git commit` and `npm publish`, Build the JS ouput before you commit to GitHub, so it's
available to people using the package. This is already done if you've been running `npm run watch`

    cd npm-package
    npm run build
    npm publish
    VER='x.y.x'     # use actual numbers
    git add . && git commit -m "Version $VER"
    git tag "$VER"
    git push && git push origin "$VER"


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

- Don't require localeCode in new Lexicon(), i.e. change the signature so it's:
      constructor(contentByLocale: ContentByLocale,
                  filename: string,
                  subset: KeyPath = '',
                  localeCode: LocaleCode = DEFAULT_LOCALE_CODE
                  )

- I wish I could define the Lexicon I need in each module so I wasn't passing them all around. Yet I
  still want the editor to access them all.

- Editor can check types of content, e.g. must be a number, date, or list has elements of a
  particular shape {question: ___, answer: ___}
