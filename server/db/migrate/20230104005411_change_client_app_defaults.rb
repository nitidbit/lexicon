class ChangeClientAppDefaults < ActiveRecord::Migration[5.1]
  def change
    change_column_default :client_apps, :git_branch, from: "master", to: "main"
  end
end
