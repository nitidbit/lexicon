require 'octokit'

module Services
  module Adapters
    module Lexicon

      # Allow a config file to describe which adapter to use.
      def self.configure(configuration_hash)
        lexicon_adapter =
          case configuration_hash[:class].to_sym
          when :file
            File.new
          when :github
            GitHub.new(access_token: configuration_hash[:access_token],
                       repo:         configuration_hash[:repo],
                       branch:       configuration_hash[:branch])
          end
        lexicon_adapter
      end

      class File
        def read(filename)
          Rails.logger.info("Lexicon: Reading from local file system '#{filename}'")
          f = ::File.read(filename)
          JSON.parse f
        end

        def write(filename, hash, _commit_message)
          Rails.logger.info("Lexicon: Writing to local file system '#{filename}'")
          ::File.open(filename, 'w') do |f|
            f.write JSON.pretty_generate(hash)
          end
        end
      end

      class GitHub
        attr_accessor :github

        def initialize(access_token:, repo:, branch:)
          self.github = Octokit::Client.new access_token: access_token
          @shas = {}
          @repo = repo
          @branch = branch
        end

        def read(filename)
          Rails.logger.info("Lexicon: Reading from github '#{filename}'")
          resource =
            github.contents(
              @repo,
              ref: @branch,
              path: filename
            )

          @shas[filename] = resource.sha
          JSON.parse(Base64.decode64(resource.content))
        end

        def write(filename, hash, commit_message)
          Rails.logger.info("Lexicon: Writing to github '#{filename}'")
          # make sure we have an updated SHA for the file
          read(filename)

          github.update_contents(
            @repo,
            filename,
            commit_message,
            @shas[filename],
            JSON.pretty_generate(hash),
            branch: @branch
          )
        end
      end
    end
  end
end
