Clearance.configure do |config|
  config.routes = false # Added routes manually
  config.mailer_sender = "reply@example.com"
  config.rotate_csrf_on_sign_in = true
  config.redirect_url = "/edit"
end
