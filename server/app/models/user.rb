class User < ApplicationRecord
  include Clearance::User

  has_and_belongs_to_many :client_apps

  # Allows admin > users to edit user, without changing password
  def skip_password_validation?
    true
  end
end
