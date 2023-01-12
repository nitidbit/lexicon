#
# Action Mailer
#


Rails.application.configure do
  sendgrid_api_key = ENV.fetch('SENDGRID_API_KEY', nil)

  if sendgrid_api_key
    config.action_mailer.default_url_options = {
      scheme: APP_URL.scheme,
      host: APP_URL.host,
      port: APP_URL.port }
    config.action_mailer.delivery_method = :sendgrid_actionmailer
    config.action_mailer.perform_deliveries = true
    config.action_mailer.sendgrid_actionmailer_settings = {
      api_key: sendgrid_api_key,
      raise_delivery_errors: true,
    }
  end
end
