class User < ApplicationRecord
  include Clearance::User

  has_and_belongs_to_many :client_apps

  def self.ransackable_attributes(_auth_object = nil)
    %w[
      confirmation_token
      created_at
      email
      encrypted_password
      id
      is_admin
      remember_token
      updated_at
    ]
  end

  def self.ransackable_associations(_auth_object = nil)
    ["client_apps"]
  end

  # Allows admin > users to edit user, without changing password
  def skip_password_validation?
    true
  end
end
