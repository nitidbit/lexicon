Read-Me for Developers working on Lexicon itself
================================================


Developing the Lexicon NPM Package
----------------------------------

If you are just using Lexicon in your project, ignore this section.

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
    change package.json > version

Right before you check-in, Build the JS ouput before you commit to GitHub, so it's available to
people using the package. This is already done if you've been running `npm run watch`

    npm run tsc
    VERSION=<major>.<minor>.<patch>
    git add . && git commit -m "Version ${VERSION}"
    git tag ${VERSION}
    git push && git push origin ${VERSION}


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
