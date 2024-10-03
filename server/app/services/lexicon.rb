# Ruby version of a Lexicon
class Lexicon

  VERSION = '2.12.3'.freeze

  def initialize(filename)
    extension = File.extname(filename)
    @locale = 'en'
    @strings =
      case extension
      when '.json'
        File.open(filename) { |f| JSON.parse(f) }
      when /\.(yml|yaml)/
        YAML.load_file(filename)
      else
        raise "Don't know how to read file with extension #{extension}. Filename: #{filename}"
      end
  end

  def get(dotted_key)
    Rodash.get(@strings, [@locale, dotted_key].join('.'))
  end

  def inspect
    @strings.inspect
  end
end
