Lexicon Server
==============
Lexicon is Nitid Bit's system to allow clients to edit content (text and values) in their websites
and decision support tools. This repo contains (1) the LexiconSaver class (Ruby) which handles reading responses from LexiconEditor, and saving it to a local file or GitHub, and (2) a Rails app that runs on Heroku and can handle EditWrapper calls if you don't want to do it in your own app.

- Production v1: https://lexicon-editor.herokuapp.com -- sign in at MyBC/sign_in
    used by MyBC
- Production v2: https://lexicon-production.herokuapp.com/sign_in
    used by abortionfinder.org
- Staging: https://lexicon-server-staging.herokuapp.com/sign_in

Pages:
- /demo — See Lexicon in action. Also a testbed for making sure it's working.
- /sign_in — for configuring and editing other websites that use Lexicon
  

Git repos:
- lexicon -- an NPM module containing client-side code and React components for using and editing a Lexicon.
- lexicon-server -- a Rails app which allows saving edits to Github


Where are we using Lexicon?
---------------------------
- www.bedsider.org
  - uses internal editor
- [HIV DST](http://hiv-dst.herokuapp.com/)
- [MyBC disemination site](http://mybcweb.s3-website-us-west-2.amazonaws.com/)
  - uses server: http://lexicon-editor.herokuapp.com
- [MyBC Peripartum disemination site](http://mybcweb-pp.s3-website-us-west-2.amazonaws.com/)
- [MyPath disemination site](http://mypathweb.s3-website.us-east-2.amazonaws.com/)

Using Lexicon-Server to Edit Content on a Server-less App
---------------------------------------------------------
Lets say you have a server-less app, like the MyPath disseminations sites. Let's call it "MyApp."
You want to use Lexicon editing which requires a server but your app has none. That's where Lexicon
Server comes in. You can configure Lexicon Server to write to your GitHub repo, and add the users
who will be editing. Here's how (using the Lexicon staging server):

Create your React app, with EditWrappers. For the <EditWrapper apiUpdateUrl={}> prop, use
$SERVER/update, e.g. http://lexicon-server-staging.herokuapp.com/update

Create a Client App on Lexicon which represents your instance of MyApp.
- Sign in as an admin: http://lexicon-server-staging.herokuapp.com/sign_in
- Go to Admin > Client Apps, create a new one.
- You'll need to create a GitHub personal access token for the API call. We recommend making a user
  account at github with only 'repo' access to one repo, rather than making an access token on your
  developer account which has access to many more repos.

Create Lexicon Users linked to MyApp
- Go to Admin > Users, and create some.
- Make sure they are linked to the MyApp ClientApp. Link yourself too.
- Click on "Apps to Edit." This shows all the ClientApps you are linked to. When clients sign in to edit
  their apps, they will only see this page. They will not have access to the Lexicon admin pages.
  They will see this Apps to Edit list with one or two apps there.

Test that all the access keys work
- on Apps to Edit,
- Click on MyApp. You should see MyApp in your browser, but you are authenticated through Lexicon
  Server so you see Edit Content buttons wherever you had an EditWrapper in your code.
- Click Edit Content, change some stuff, then click Save.
- Verify that there is a new GitHub commit with your changes.

Share Lexicon User credentials and the secret /sign-in/ link with your clients.


Adding a Lexicon API endpoint to my Rails app so I can host Lexicon editing
---------------------------------------------------------------------------
For now, you'll need to copy the Lexicon Saver and Adapter files to your Rails app. Eventually we
will make a Gem that you can bundle in.

- Copy these files:
- Add an API endpoint:


Developer Setup
---------------

    bundle
    rails db:create db:schema:load db:test:prepare
    rspec
    rails s
    browse http://localhost:3000/sign_in

Deploy
------
- Change the version in `lib/lexicon.rb`
- staging — Heroku is configured to automatically deploy from Github's 'main' branch.
- production — Use Heroku pipeline

Configuration
-------------

LexiconAdapter — This can be either a filesystem adapter or a GitHub adapter. The filesystem adapter changes files directly on the local filesystem, while the GitHub adapter changes a remote GitHub repository. Because changes made by the GitHub adapter won't actually appear until a `git pull` is done on the server, it should generally only be used in staging and production (only if a lexicon server is running in production at all).

The GitHub adapter requires three arguments: an access token, the repository name, and the branch name. The easiest way to get an access token is to go to [Developer settings -> Personal access tokens](https://github.com/settings/tokens) on GitHub's settings and generate a new personal access token. This grants unrestricted access to an entire GitHub account, so the token should be treated like a password. On Bedsider, instead of a token for any developer's account, we made one for the GitHub user @bedsider.

You also need a `JWT_SECRET`, a secret key used to authenticate access to the LexiconServer's API. This can be generated at the command line with `rails secret` and stored in `JWT_SECRET` in the configuration for any environment. In production, the environment variable `JWT_SECRET` is automatically used.

## Create first user
    User.create!(email: 'winston@nitidbit.com', password: '...')

