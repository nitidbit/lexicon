# A Nitid app that uses this LexiconServer to save content edits.
class ClientApp < ApplicationRecord
  has_and_belongs_to_many :users

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
