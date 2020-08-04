class RemoveSessionModel < ActiveRecord::Migration[5.1]
  def up
    drop_table 'sessions'
  end

  def down
    create_table "sessions", force: :cascade do |t|
      t.boolean "logged_out"
      t.datetime "valid_until"
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
    end
  end
end
