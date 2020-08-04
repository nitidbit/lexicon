class CreateSessions < ActiveRecord::Migration[5.1]
  def change
    create_table :sessions do |t|
      t.boolean :logged_out
      t.datetime :valid_until

      t.timestamps
    end
  end
end
