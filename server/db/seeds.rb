# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).


if ! User.find_by(email: 'foo@nitidbit.com')
  puts User.create( is_admin: true, email: 'foo@nitidbit.com', password: 'joust.galaga.pacman') # Be sure to change this
end
foo_user = User.find_by( email: 'foo@nitidbit.com')

if ! ClientApp.find_by(name: 'Lexicon React Demo')
  puts ClientApp.create(name: 'Lexicon React Demo',
                   app_url: 'http://localhost:3000/demo',
                   adapter: 'github',
                   github_repo: 'nitidbit/lexicon',
                   git_branch: 'lexicon-test',
                   users: [foo_user]
                  )
end

if ! ClientApp.find_by(name: 'Localhost test page')
  puts ClientApp.create(name: 'Localhost test page',
                   app_url: 'http://localhost:3000/testing',
                   adapter: 'github',
                   github_repo: 'nitidbit/lexicon',
                   git_branch: 'lexicon-test',
                   users: [foo_user]
                  )
end

if ! ClientApp.find_by(name: 'CORS test page')
  puts ClientApp.create(name: 'CORS test page',
                   app_url: 'http://cors.test:3000/testing',
                   adapter: 'github',
                   github_repo: 'nitidbit/lexicon',
                   git_branch: 'lexicon-test',
                   users: [foo_user]
                  )
end
