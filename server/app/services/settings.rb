class Settings

  def self.singleton
    settings_section = if Rails.env.production?
                         ENV.fetch('SETTINGS_SECTION') # differentiate staging from prod
                       else
                         Rails.env
                       end

    @singleton ||= Settings.new(
      Rails.root.join('config/settings.yml'),
      settings_section)
  end

  def self.fetch(key, fallback = :raise_error)
    singleton.fetch(key, fallback)
  end

  def self.list
    singleton.list
  end

  def initialize(yml_filename, section)
    @yaml = YAML.load_file(yml_filename)
    @section = section
  end

  # Return configuration setting from:
  # - environment variable
  # - settings.yml
  # - 'fallback' argument
  # raises an exception if the key is not found and no fallback specified
  def fetch(key, fallback = :raise_error)
    key_s = key.to_s
    value = ENV.fetch(key_s, nil) || @yaml.dig(@section, key.to_s) || fallback
    raise("Settings: key #{key.inspect} not found") if value == :raise_error

    value
  end

  # Return a hash of credentials, but with some of the secret hidden, in case you want to log it.
  # handy command line: `rails r "pp Credentials.list"`
  def list
    env_credentials
      .transform_values { |value| "#{value[0..3]}..#{value[-4..]}" }
  end

end

