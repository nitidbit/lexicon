# https://thecodest.co/blog/rails-api-cors-dash-of-consciousness/

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "*" # allow JS access from all origins to the OPTIONS method, but 'PUT /update' restricts it more
    resource "/update", headers: :any, methods: [:put]
  end
end
