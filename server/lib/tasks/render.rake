# Tasks related to render.com

require 'rubygems'
include Rake::DSL

namespace :render do

    desc 'Import lastest.dump to local DB'
    task :import_db do
      puts "Importing local.dump to local Postgresql."
      system("pg_restore --verbose --clean --no-acl --no-owner -h localhost -d lexicon_development latest.dump")
    end

    desc 'Restore latest.dump some Postgres server, e.g. staging'
    task :restore_db do
      puts "Restoring local.dump to a DB."
      db_url = ask_string('What is the connection string for the target DB? I.e. what DB to overwrite?', '')

      system("pg_restore --verbose --clean --no-acl --no-owner --dbname=#{db_url} latest.dump")
    end
end

def ask_string(question, default_answer)
  print "#{question}\n[RETURN = #{default_answer}] ? "
  result = $stdin.gets.chomp
  result = default_answer if result.blank?
  result
end

