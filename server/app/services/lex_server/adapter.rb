require 'octokit'

# Adapters to write Lexicon changes to either a local file, or to GitHub.
module LexServer
  module Adapter

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


    # Save changes to a local file
    class File

      # Returns true if we are able to access the repo, otherwise false.
      def test_access
        {succeeded: true, msgs: ['Filesystem access is always available.']}
      end

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


    # Save changes to a github repo
    class GitHub
      attr_accessor :github

      def initialize(access_token:, repo:, branch:)
        self.github = Octokit::Client.new access_token: access_token
        @shas = {}
        @repo = repo
        @branch = branch
      end

      # Tries to contact the Github repo, and returns status plus messages about what worked and
      # what didn't
      def test_access
        succeeded = true
        msgs = []

        # Test that access_token is accepted
        begin
          login_name = github.user.login
          msgs << "User '#{login_name}' authenticated successfully so access_token is good."
        rescue Octokit::Unauthorized => exc
          succeeded = false
          msgs << exc.to_s # an error occurred. Here's a clue why.
        end

        # Test that we have read permissions at least in the repo.
        begin
          root_dir = github.contents(@repo)
          msgs << "Able to read from repo so at least READ permissions are good."
        rescue Octokit::NotFound => exc
          succeeded = false
          msgs << "Unable to access repo: #{exc.to_s}" # an error occurred. Here's a clue why.
        end

        {succeeded: succeeded, msgs: msgs}
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
