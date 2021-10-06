class AddSlackTokenToClientApps < ActiveRecord::Migration[5.1]
  def change
    add_column 'client_apps', 'slack_workflow_url', :string
  end
end
