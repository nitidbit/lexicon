#! /usr/bin/env bash
# executed by render.com: settings > Build Command
npm i
bundle install
bundle exec rake assets:precompile assets:clean db:migrate
