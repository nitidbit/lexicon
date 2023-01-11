# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).


foo_user = User.create( is_admin: true, email: 'foo@nitidbit.com', password: 'joust.galaga.pacman') # Be sure to change this

ClientApp.create(name: 'Lexicon React Demo',
                app_url: '/demo',
                adapter: 'github',
                github_repo: 'nitid/lexicon',
                users: [foo_user]
               )



