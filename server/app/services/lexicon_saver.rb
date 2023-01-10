module Services
  class LexiconSaver
    attr_reader :adapter

    def initialize(lexicon_adapter)
      # debugger
      raise ArgumentError, 'Must be a LexiconAdapter' unless lexicon_adapter.methods.include?(:read)

      @adapter = lexicon_adapter
    end

    def update_changes(editor_name, changes)
      changes.each do |change|
        change.require [:filename, :key, :newValue]
        newValue =
          if change[:newValue].is_a?(String)
            change[:newValue].delete("\r")
          else
            change[:newValue]
          end

        put_entry(
          change[:filename],
          change[:key],
          newValue,
          "#{editor_name} via Lexicon Editor"
        )
      end
    end

  private

    def entries
      entries = {}
      flatten adapter.read, entries
      entries
    end

    def put_entry(filename, key, value, commit_message)
      raise ArgumentError, 'no value supplied' if value.nil?
      Rails.logger.info("put_entry() filename=#{filename} key=#{key} value=#{value} msg=#{commit_message}")
      begin
        hash = adapter.read(filename)
        set(object: hash, keys: key.split('.'), value: value)
        adapter.write(filename, hash, commit_message)
      rescue => exc
        raise StandardError, "Problem adding entry for filename: #{filename.inspect} key: #{key.inspect} commit_message: #{commit_message.inspect} exception: #{exc.inspect}"
      end
    end

    def set(object:, keys:, value:)
      current_key = object.is_a?(Array) ? keys[0].to_i : keys[0]

      if keys.length == 1
        object[current_key] = value
      else
        set(object: object[current_key], keys: keys[1..-1], value: value)
      end
    end

    # Transform an input hash:
    #   {food: {name: "Skittles", colors: ["purple", "green", "yellow", "red", "orange"]}}
    # into this result hash:
    #   {"food.name" => "Skittles", "food.colors" => ["purple", "green", "yellow", "red", "orange"]}
    def flatten(hash, result, keys = [])
      hash.each do |key, value|
        keys.push key if value

        subject = value || key

        if subject.is_a?(Hash)
          flatten subject, result, keys
        elsif subject.is_a?(Array)
          subject.each.with_index do |v, i|
            flatten({ i.to_s => v }, result, keys)
          end
        else
          path = keys.join '.'

          if value
            result[path] = value
          else
            result[path] ||= []
            result[path] << key
          end
        end

        keys.pop if value
      end
    end
  end
end
