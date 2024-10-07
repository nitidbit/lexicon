# A Nitid app that uses this LexiconServer to save content edits.
class ClientApp < ApplicationRecord
  has_and_belongs_to_many :users

  def self.ransackable_associations(_auth_object = nil)
    ["users"]
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[
      adapter
      app_url
      created_at
      git_branch
      github_api_token
      github_repo
      github_user
      id
      name
      slack_workflow_url
      updated_at
    ]
  end

  # ActiveAdmin uses this for display
  def title
    "#{name} (#{app_url})"
  end

  def lexicon_adapter
    config_hash = {
      class: adapter,
      access_token: github_api_token,
      repo: github_repo,
      branch: git_branch,
    }
    LexServer::Adapter.configure(config_hash)
  end
end
