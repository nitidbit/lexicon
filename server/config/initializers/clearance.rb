Clearance.configure do |config|
  config.routes = false # Added routes manually
  config.mailer_sender = "Lexicon <winston@nitidbit.com>"
  config.rotate_csrf_on_sign_in = true
  config.redirect_url = "/edit"
  config.allow_sign_up = false
end
