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

      def write(filename, new_lexicon_as_hash, _commit_message)
        Rails.logger.info("Lexicon: Writing to local file system '#{filename}'")
        ::File.open(filename, 'w') do |f|
          f.write JSON.pretty_generate(new_lexicon_as_hash)
        end
      end
    end


    # Save changes to a github repo
    class GitHub
      attr_accessor :github

      def initialize(access_token:, repo:, branch:)
        @access_token = access_token
        @shas = {}
        @repo = repo
        @branch = branch
      end

      def github
        Octokit::Client.new access_token: @access_token
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

      # Returns a Hash of the JSON contents of 'filename'
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

      # Creates and pushes a commit to github, containing the files in 'filename_content_hash'
      #
      # filename_content_hash = what to write, e.g.
      #     {
      #       'path/file.json' => '{ "key": "value" }'
      #       'path/other.json' => 'contents of other.json as a string'
      #     }
      #   where the values are the complete new contents of each file.
      #
      # This article describes adding a commit with Octokit:
      #   http://mattgreensmith.net/2013/08/08/commit-directly-to-github-via-api-with-octokit/
      def write_changed_files(commit_message, filename_content_hash)
        ref = "heads/#{@branch}"

        # SHA of commit at head of 'branch'
        sha_latest_commit = github.ref(@repo, ref).object.sha
        # SHA of the tree at head of 'branch'
        sha_base_tree = github.commit(@repo, sha_latest_commit).commit.tree.sha

        added_files = filename_content_hash.map do |filename, contents|
          blob_sha = github.create_blob(@repo, Base64.encode64(contents), "base64")
          { path: filename,
            sha: blob_sha,
            mode: "100644",
            type: "blob",
          }
        end
        sha_new_tree = github.create_tree(@repo,
                                   added_files,
                                   {:base_tree => sha_base_tree }).sha

        # new commit containing the tree object that we just created
        sha_new_commit = github.create_commit(@repo, commit_message, sha_new_tree, sha_latest_commit).sha

        # move the reference heads/(branch) to point to our new commit object
        updated_ref = github.update_ref(@repo, ref, sha_new_commit)
      end
    end
  end
end
