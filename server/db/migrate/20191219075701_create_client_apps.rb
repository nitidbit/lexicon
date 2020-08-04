class CreateClientApps < ActiveRecord::Migration[5.1]
  def change
    create_table :client_apps do |t|
      t.timestamps
      t.string 'app_url', null: false, default: 'https://___.herokuapp.com'
      t.string 'github_repo', null: false, default: 'nitidbit/___'
      t.string 'git_branch', null: false, default: 'master'
      t.string 'github_api_token'
      t.string 'github_user'

      t.index ['github_repo']
    end

  end
end
