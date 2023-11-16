require 'factory_bot'
require 'factories/user'
require 'rails_helper'
require 'jwt'
require "clearance/rspec"
# require 'services/lexicon_saver'

RSpec.describe ApiController, type: :controller do
  describe '#update' do

    let(:mock_response) { double(HTTParty::Response, code: 200, parsed_response: nil) }

    before do

      allow(HTTParty).to receive(:post).with(
        "http://blah.slack.com", any_args
      ).and_return mock_response

      # allow(HTTParty).to receive(:post).and_return mock_response

      @original_content = {
        key: 'old value',
        parent: {
          child: 'old child'
        }
      }

      @tempfile = `mktemp`
      File.open(@tempfile, 'w') do |f|
        f.write JSON.pretty_generate(@original_content)
      end

      @lexicon_changes = {
        changes: [{
          filename: @tempfile,
          key: 'key',
          newValue: 'new value',
        }]}

      @user = User.create!(email: 'blaaa@example.com', password: 'super.blah.foofy.foo')
      @client_app = ClientApp.create!(name: 'sample client app', app_url: 'http://example.com', adapter: 'file')
      @client_app_with_slack = ClientApp.create!(
        name: 'sample client app with slack',
        app_url: 'http://example.com',
        adapter: 'file',
        slack_workflow_url: 'http://blah.slack.com'
        )
      @client_app_with_slack_empty = ClientApp.create!(
        name: 'sample client app with slack',
        app_url: 'http://example.com',
        adapter: 'file',
        slack_workflow_url: ''
        )
    end

    after do
      @user.destroy
    end

    context 'when not logged in' do
      it 'rejects any update requests' do
        put(:update, params: @lexicon_changes)

        contents = File.read(@tempfile)
        expect(JSON.parse(contents)['key']).to eq('old value')
      end
    end

    context 'when logged in' do
      before do
        @token = ApiController::lexicon_server_token(@user, @client_app)
        request.headers['Authorization'] = "Bearer #{@token}"
      end

      it 'updates the specified key in the file' do
        put(:update, params: @lexicon_changes)

        contents = File.read(@tempfile)
        expect(JSON.parse(contents)['key']).to eq('new value')
      end

      it 'works for nested keys' do
        @lexicon_changes[:changes][0][:key] = 'parent.child'
        @lexicon_changes[:changes][0][:newValue] = 'new child'

        put(:update, params: @lexicon_changes)

        contents = File.read(@tempfile)
        expect(JSON.parse(contents)['parent']).to eq('child' => 'new child')
      end

      it 'alerts changes via Slack when "slack_workflow_url" is filled in' do
        @token = ApiController::lexicon_server_token(@user, @client_app_with_slack)
        request.headers['Authorization'] = "Bearer #{@token}"

        expect(HTTParty).to receive(:post).with("http://blah.slack.com", any_args)
        put(:update, params: @lexicon_changes)
      end

      it 'does not talk to Slack when "slack_workflow_url" is empty string' do
        @token = ApiController::lexicon_server_token(@user, @client_app_with_slack_empty)
        request.headers['Authorization'] = "Bearer #{@token}"

        expect(HTTParty).to_not receive(:post)
        put(:update, params: @lexicon_changes)
      end

      it 'includes CORS header for allowed origin' do
        @client_app.update(app_url: 'http://blah.example.com:123/test?x=y')
        put(:update, params: @lexicon_changes)
        expect(response.headers['Access-Control-Allow-Origin']).to eq('http://*.example.com:123')
      end

      it 'fails when user is not permitted to access repo'
      it 'fails when lexiconServerToken has timed out'
    end

    context 'when server token is for a particular ClientApp at GitHub' do
      before do
        @client_app.update(
          app_url: 'http://sample.example.com',
          adapter: 'github',
          github_repo: 'sample github_repo',
          git_branch: 'sample git_branch',
          github_api_token: 'sample git_api_token')
        @token = ApiController::lexicon_server_token(@user, @client_app)
        request.headers['Authorization'] = "Bearer #{@token}"

        allow(LexServer::Adapter).to receive(:configure).and_return(
          double('sample lexicon adapter',
            read: {},
            write_changed_files: nil
          ))

        @lexicon_changes[:changes][0][:filename] = 'sample-filename.json'
      end

      it "uses that Clientapp's GitHub access key" do
        expect(LexServer::Adapter).to receive(:configure).with({
          class: 'github',
          repo: 'sample github_repo',
          branch: 'sample git_branch',
          access_token: 'sample git_api_token'
        })
        put(:update, params: @lexicon_changes)
      end

      it "writes to filename set in ClientApp" do
        lexicon_adapter = LexServer::Adapter.configure({})
        expect(lexicon_adapter).to receive(:read).with('sample-filename.json')
        expect(lexicon_adapter).to receive(:write_changed_files).with('blaaa@example.com via Lexicon Editor', anything)
        put(:update, params: @lexicon_changes)
      end
    end
  end

  describe '.cors_friendly_origin' do
    it 'returns URL including port when the port is NOT the normal one' do
      url = 'http://localhost:3000/mydir'
      expect(ApiController.cors_friendly_origin(url)).to eq('http://localhost:3000')
    end

    it 'excludes port when the port IS the normal one' do
      url = 'https://lexicon.nitid.co/mydir'
      expect(ApiController.cors_friendly_origin(url)).to eq('https://*.nitid.co')
    end
  end

end
