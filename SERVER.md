Lexicon Server
==============

- production: https://lexicon.nitid.co/sign_in
- staging: https://lexicon-staging.onrender.com/sign_in -- for testing Lexicon itself

Pages:
- /sign_in — for configuring and editing other websites that use Lexicon
- /demo — See Lexicon in action. Also a testbed for making sure it's working.


What is Lexicon-Server For?
---------------------------
Let's say you have a JS app that has textual content and you want clients to be able to update that
content without involving engineers. <Lexicon> & <LxProvider> allows editing, but it must save the
changes somewhere.  That's what Lexicon-Server is for. LxProvider sends it to Lexicon-Server, and
it will then save the changes into your github repo, ready for the next build.

Using Lexicon-Server with Clients for Content Editing
-----------------------------------------------------
Create your React app, with <LxProvider>. For the `apiUpdateUrl` prop, use
$SERVER/update, e.g. http://lexicon-server-staging.onrender.com/update

Create a Client App on Lexicon which represents your instance of MyApp.
- Sign in as an admin: https://lexicon.nitid.co/sign_in
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
  Server so you see Edit Content buttons wherever you had <LxProvider> in your code.
- Click Edit Content, change some stuff, then click Save.
- Verify that there is a new GitHub commit with your changes.

Share Lexicon User credentials and the secret /sign-in/ link with your clients.


Developer Information
=====================

Developer Setup
---------------

    cd (lexicon proj folder)/server
    bundle
    npm i
    rails db:create db:schema:load db:test:prepare db:seed
    bundle exec rspec

    cd ..
    ./runit.sh
    browse http://localhost:3000/sign_in

If you have an error saying '../builds' must be a folder, you may have to run refresh.sh.
On first installation you may have to cancel and restart once.

Handy Scripts dealing with server
---------------------------------
- bundle exec rails render:import_db — Import lastest.dump to local DB
- bundle exec rails render:restore_db — Restore latest.dump some Postgres server, e.g. staging
- psql lexicon_development < ___.sql — restore DB from Render.com. Download the .sql.gz from Render

Deploy
------
- Change the version in `server/app/services/lexicon.rb`
- staging — Render.com is configured to automatically deploy from Github's 'main' branch.
- production — Similarly, automatic deploy from 'production' branch

Configuration
-------------

LexiconAdapter — This can be either a filesystem adapter or a GitHub adapter. The filesystem adapter changes files directly on the local filesystem, while the GitHub adapter changes a remote GitHub repository. Because changes made by the GitHub adapter won't actually appear until a `git pull` is done on the server, it should generally only be used in staging and production (only if a lexicon server is running in production at all).

The GitHub adapter requires three arguments: an access token, the repository name, and the branch name. The easiest way to get an access token is to go to [Developer settings -> Personal access tokens](https://github.com/settings/tokens) on GitHub's settings and generate a new personal access token. This grants unrestricted access to an entire GitHub account, so the token should be treated like a password. On Bedsider, instead of a token for any developer's account, we made one for the GitHub user @bedsider.

You also need a `JWT_SECRET`, a secret key used to authenticate access to the LexiconServer's API. This can be generated at the command line with `rails secret` and stored in `JWT_SECRET` in the configuration for any environment. In production, the environment variable `JWT_SECRET` is automatically used.

## Create first user
    User.create!(is_admin: true, email: 'winston@nitidbit.com', password: '...')

