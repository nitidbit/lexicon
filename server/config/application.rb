require_relative 'boot'

require 'rails/all'

APP_URL = URI(ENV['APP_URL'] || 'http://localhost:3000')

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module LexiconServer
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 5.1

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.
    config.autoload_paths << Rails.root.join('app')
    config.autoload_paths << Rails.root.join('lib')
    config.autoload_paths << Rails.root.join('admin')

    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins '*'
        resource '*', headers: :any, methods: [:get, :post, :put, :options]
      end
    end
  end
end
