require "rails_helper"

RSpec.describe LexServer::Adapter do
  describe LexServer::Adapter::File do
    let(:file_adapter) { LexServer::Adapter::File.new }

    describe "#write_changed_files" do
      it "writes all changed files to the file system" do
        # create a temp json file
        File.open("/tmp/lex-adapter.json", "w") do |f|
          f.write JSON.pretty_generate({ a: "old value" })
        end

        # run write_changed_files() with some sample changes
        file_adapter.write_changed_files(
          "test commit with two files",
          { "/tmp/lex-adapter.json" => '{ "b": "REPLACED VALUE" }' },
        )

        # verify the temp json file has been modified.
        expect(File.read("/tmp/lex-adapter.json")).to eq(
          '{ "b": "REPLACED VALUE" }',
        )
      end
    end
  end

  describe LexServer::Adapter::GitHub do
    let(:gha) do
      LexServer::Adapter::GitHub.new(
        access_token: "TOKEN",
        repo: "nitidbit/lexicon",
        branch: "test/foo",
      )
    end
    let(:oktokit) { double("Oktokit Client") }

    describe "#write_changed_files" do
      it "creates one commit with all the files changed" do
        allow(gha).to receive(:github).and_return(oktokit)
        expect(oktokit).to receive(:ref).and_return(spy("REF"))
        expect(oktokit).to receive(:commit).and_return(spy("HEAD_COMMIT"))
        expect(oktokit).to receive(:create_blob).twice.and_return(spy("BLOB"))
        expect(oktokit).to receive(:create_tree).and_return(spy("TREE"))
        expect(oktokit).to receive(:create_commit).and_return(spy("NEW_COMMIT"))
        expect(oktokit).to receive(:update_ref)
        gha.write_changed_files(
          "test commit with two files",
          {
            "server/spec/services/lex_sever/a.json" => '{ "a": "aaa-3" }',
            "server/spec/services/lex_sever/b.json" => '{ "b": "bbb-3" }',
          },
        )
      end
    end
  end
end
