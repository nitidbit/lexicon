# Takes a list of of changes and saves them via 'lexicon_adapter'
module LexServer
  class Saver
    attr_reader :adapter

    def initialize(lexicon_adapter)
      # debugger
      raise ArgumentError, 'Must be a LexiconAdapter' unless lexicon_adapter.methods.include?(:read)

      @adapter = lexicon_adapter
    end

    def update_changes(editor_name, changes)
      files_with_changes = changes.group_by { |row| row["filename"] }

      # For each file modified:
      filenames_and_contents = files_with_changes.to_h do |filename, file_changes|
        hash = adapter.read(filename) # Read old version
        file_changes.each do |change| # Add all the changes for this file
          set(object: hash, keys: change["key"].split('.'), value: change["newValue"])
        end
        [filename, JSON.pretty_generate(hash)]
      end

      # Push a commit with all the change files.
      commit_msg = "#{editor_name} via Lexicon Editor"
      adapter.write_changed_files(commit_msg, filenames_and_contents)
    end

  private

    def entries
      entries = {}
      flatten adapter.read, entries
      entries
    end

    def set(object:, keys:, value:)
      current_key = object.is_a?(Array) ? keys[0].to_i : keys[0]

      if keys.length == 1
        object[current_key] = value
      else
        set(object: object[current_key], keys: keys[1..], value:)
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
