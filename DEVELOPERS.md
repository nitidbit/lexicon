Read-Me for Developers working on Lexicon itself
================================================

- [Github package registry]( https://github.com/nitidbit/lexicon/pkgs/npm/lexicon )

- [Story and bug tracker]( https://app.shortcut.com/lexicon/stories/space/2272?team_scope_id=v2%3At%3A66284048-8323-4dd5-bbaa-91068f5b1cea%3A66284048-78ff-4daf-ab41-b7f66ad3455d )


Developing the Lexicon NPM Package
----------------------------------
If you are just using Lexicon in your project, you can ignore this file.

### Coding Lexicon and your Project at the same time
Sometimes you are working on your project, which uses Lexicon, but you are tweaking Lexicon at the
same time. You want a change in Lexicon source code to be immediately reflected in your project.
Normally you'd have to change Lexicon, publish the change to the NPM registry, and reinstall Lexicon
for your project. But here's a way to temporarily link them directly:

(1) In Lexicon folder:

    cd "__SOMEWHERE__/lexicon/"
    npm link __YOUR_PROJECT__/node_modules/react    # having two versions of React will bork things
    npm link __YOUR_PROJECT__/node_modules/react-dom
    ./runit.sh                                      # automatically build JS files when editing TSX

(1) In your_project's folder:

    cd "__YOUR_PROJECT__/"
    npm link __SOMEWHERE__/lexicon/npm-package

To reset things:
    cd "__SOMEWHERE__/lexicon/"
    npm unlink
    cd "__YOUR_PROJECT__/"
    npm unlink

### Compilation

While developing, run tsc in the background, watching your changes and recompiling
    cd npm-package
    npm i
    npm run build:watch

You should also make sure that all tests pass:

    npm run test (or npm run test:watch)


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

- Editor can check types of content, e.g. must be a number, date, or list has elements of a
  particular shape {question: ___, answer: ___}
