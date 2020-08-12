# A Nitid app that uses this LexiconServer to save content edits.
class ClientApp < ApplicationRecord
  has_and_belongs_to_many :users

  # ActiveAdmin uses this for display
  def title
    "#{name} (#{app_url})"
  end
end

