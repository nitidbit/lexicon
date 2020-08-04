class AddUserClientApps < ActiveRecord::Migration[5.1]
  def change
    create_table 'client_apps_users' do |t|
      t.timestamps

      t.integer 'user_id', null: false
      t.integer 'client_app_id', null: false

      t.index ['user_id']
      t.index ['client_app_id']
    end
  end
end
