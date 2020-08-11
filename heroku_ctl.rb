#!/usr/bin/env ruby

# Commands related to deploying on Herku, i.e. called at various places in deploy process.

def shell(cmd)
  puts "\nheroku_ctl: #{cmd}"
  puts `#{cmd}`
end

module Tasks

  def self.configure_buildpacks(heroku_app)

    shell("heroku buildpacks:clear --app #{heroku_app}")

    # Move our /js_lib/ folder into /server/vendor/
    shell("heroku config:set BUILDPACK_RUN=\"./heroku_ctl.rb move_js_lib\" --app #{heroku_app}")
    shell("heroku buildpacks:add https://github.com/weibeld/heroku-buildpack-run --app #{heroku_app}")

    # Move the /server/ folder down to the root so Heroku runs rails
    shell("heroku config:set PROJECT_PATH=server --app #{heroku_app}")
    shell("heroku buildpacks:add https://github.com/timanovsky/subdir-heroku-buildpack --app #{heroku_app}")

    # Start Rails
    shell("heroku buildpacks:add heroku/ruby --app #{heroku_app}")
  end


  # Called by buildpack above
  def self.move_js_lib
    # Simulate installing Lexicon
    shell('mkdir -p $BUILD_DIR/server/node_modules/lexicon')
    shell('mv $BUILD_DIR/js           $BUILD_DIR/server/node_modules/lexicon/')
    shell('mv $BUILD_DIR/package.json $BUILD_DIR/server/node_modules/lexicon/')
  end


  # The postdeploy script is run once, after the app is created and not on subsequent deploys
  # to the app
  # https://devcenter.heroku.com/articles/app-json-schema#example-app-json
  def self.app_json_postdeploy
  end


  # The release command runs in a one-off dyno whenever a new release is created, unless the release
  # is caused by changes to an add-on’s config vars. All of the following events create a new
  # release:
  #   - successful app build
  #   - change to the value of a config var (unless the config var is associated with an add-on)
  #   - pipeline promotion
  #   - rollback
  #   - release via the platform API
  #   - Provisioning a new add-on
  # https://devcenter.heroku.com/articles/release-phase
  def self.procfile_release
    shell('bundle exec rake db:migrate')
  end

end

cmd = ARGV[0]
avail_cmds = (Tasks.methods - Object.methods).map(&:to_s)
if avail_cmds.include? cmd
  other_args = ARGV[1..-1]
  Tasks.send(cmd.to_sym, *other_args)
else
  puts 'Usage: heroku_ctl.rb <command> [more args]'
  puts "       where commands are: #{avail_cmds.join(', ')}"
end
