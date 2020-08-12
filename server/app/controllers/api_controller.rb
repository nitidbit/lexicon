require 'argon2'
require 'jwt'

def permitted_changes(params)
  params.require(:changes).map{|c| c.permit(:filename, :key, :newValue)}
end

class ApiController < ApplicationController
  JWT_ALGORITHM = 'HS256'

  before_action :authenticate_jwt_header, except: [:cookie_auth_update]
  skip_before_action :verify_authenticity_token, except: [:cookie_auth_update] # check CSRF
  before_action :require_login, only: [:cookie_auth_update]

  # Update API endpoint, authenticated via JWT token in header
  def update
    changes = permitted_changes(params)
    # Security note: Someone can send any filename, and we will try to modify it. We are trusing
    # our authenticated users.
    lsaver = lexicon_saver({
      class: @authenticated_client_app.adapter,
      access_token: @authenticated_client_app.github_api_token,
      repo: @authenticated_client_app.github_repo,
      branch: @authenticated_client_app.git_branch,
    })

    begin
      lsaver.update_changes(@authenticated_user.email, changes)
      response = { successful: true, error: nil }
    rescue => exc
      response = { successful: false, error: exc.inspect }
    end

    render json: response
  end

  # Update API endpoint, authenticated by session/login
  def cookie_auth_update
    changes = permitted_changes(params)
    lsaver = lexicon_saver(:file, nil)

    begin
      lsaver.update_changes(@authenticated_user.email, changes)
      response = { successful: true, error: nil }
    rescue => exc
      response = { successful: false, error: exc.inspect }
    end
    render json: response
  end

  # Return the token that 'authenticate_jwt_header' requires
  def self.lexicon_server_token(user, client_app)
    payload = {
      userId: user.id,
      clientAppId: client_app.id,
    }
    token = JWT.encode(payload, JWT_SECRET, JWT_ALGORITHM)
  end

  private

  def lexicon_saver(configuration_hash)
    adapter = Services::Adapters::Lexicon.configure(configuration_hash)
    Services::LexiconSaver.new(adapter)
  end

  # Examine the 'Authorization: Bearer <JWT token>' header, check signature
  # sets '@authenticated_user'
  def authenticate_jwt_header
    @authenticated_user = nil
    @authenticated_client_app = nil
    pattern = /^Bearer /
    header = request.headers['Authorization']

    if ! header&.match(pattern)
      return render_error('Missing Lexicon Server Token', :forbidden)
    end

    token = header.gsub(pattern, '')
    begin
      payload = JWT.decode(token, JWT_SECRET, true, algorithm: JWT_ALGORITHM)[0]
      @authenticated_user = User.find(payload['userId'])
      @authenticated_client_app = ClientApp.find(payload['clientAppId'])

    rescue JWT::VerificationError, JWT::DecodeError, ActiveRecord::RecordNotFound => exc
      return render_error('Invalid Lexicon Server Token', :forbidden)
    end
  end

  # Standard format for API responses
  def api_response(successful:, error: nil)
    { successful: successful, error: error }
  end

  def render_error(message, status)
    render json: api_response(successful: false, error: message), status: status
  end
end