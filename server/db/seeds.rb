# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).

def create_or_update(model_class, search_key, data)
  search_value = data[search_key]
  the_instance = model_class.find_by({ search_key => search_value })

  if the_instance.present?
    the_instance.update(data)
    if the_instance.previous_changes.present?
      puts "Updating the #{model_class} where #{search_key.to_s} == #{search_value}"
      puts "  Changes: #{the_instance.previous_changes.inspect}"

    else
      puts "No changes to #{model_class} where #{search_key.to_s} == #{search_value}"
    end
  else
    puts "Creating #{model_class} where #{search_key.to_s} == #{search_value}"
    the_instance = model_class.create!(data)
  end

  the_instance
end

create_or_update(User, :email,
  email: 'winston@nitidbit.com',
  encrypted_password: '$2a$12$Tr2IVpiIFVLA1GFoZtAaaOiWusf5lD0nUniiJhB7ZpqaqM6Il/0oS' # joust.galaga.pacman
)

create_or_update(ClientApp, :app_url,
  app_url: 'https://lexicon-server-staging.herokuapp.com/demo',
  github_repo: 'nitidbit/lexicon-server',
  git_branch: 'master',
  github_api_token: '',
  github_user: '___@nitidbit.com')

create_or_update(ClientApp, :app_url,
  app_url: 'http://localhost:3000/demo',
  github_repo: 'nitidbit/lexicon-server',
  git_branch: 'master',
  github_api_token: '',
  github_user: '___@nitidbit.com')
