class WelcomeController < ApplicationController
  before_action :require_login, except: [:index]

  def index
  end

  def edit

    @client_app_links = current_user.client_apps
      .order(:github_repo, :name)
      .map do |client_app|
        lexicon_server_token = ApiController::lexicon_server_token(current_user, client_app)
        url_with_token = "#{client_app.app_url}?lexiconServerToken=#{lexicon_server_token}"

        {
          url: url_with_token,
          name: client_app.name,
          git_branch: client_app.git_branch,
          github_repo: client_app.github_repo,
        }
      end
  end

  def demo
    @how_is_lexicon_module_linked = %x(ls -l node_modules/lexicon)
  end
end
