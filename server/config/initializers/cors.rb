# https://thecodest.co/blog/rails-api-cors-dash-of-consciousness/

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins '*'
    resource '/update', headers: :any, methods: [:put]
  end
end
