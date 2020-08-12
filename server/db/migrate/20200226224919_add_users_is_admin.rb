class AddUsersIsAdmin < ActiveRecord::Migration[5.1]
  def change
    add_column 'users', 'is_admin', :boolean, default: false
    add_column 'client_apps', 'adapter', :string, default: 'github', null: false
    add_column "client_apps", "name", :string
    change_column_null "client_apps", 'github_repo', true
    change_column_null "client_apps", 'git_branch', true

    reversible do |dir|
      dir.up do
        ApplicationRecord.connection.execute('UPDATE users SET is_admin=true')
        ApplicationRecord.connection.execute("UPDATE client_apps SET adapter='github'")
        ApplicationRecord.connection.execute("UPDATE client_apps SET name=CONCAT('app ', id)")

        change_column_null "client_apps", "name", false
      end
    end

  end
end
