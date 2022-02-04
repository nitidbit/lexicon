require 'rails_helper'
require 'jwt'

RSpec.describe ApiController, type: :controller do
  describe '#update' do
    before do
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
      @client_app = ClientApp.create!(name: 'sample client app', app_url: 'example.com', adapter: 'file')
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
        @client_app.update(slack_workflow_url: 'http://blah.slack.com')

        expect(HTTParty).to receive(:post)
        put(:update, params: @lexicon_changes)
      end

      it 'does not talk to Slack when "slack_workflow_url" is empty string' do
        @client_app.update(slack_workflow_url: '')

        expect(HTTParty).to_not receive(:post)
        put(:update, params: @lexicon_changes)
      end

      it 'fails when user is not permitted to access repo'
      it 'fails when lexiconServerToken has timed out'
    end

    context 'when server token is for a particular ClientApp at GitHub' do
      before do
        @client_app.update(
          app_url: 'sample app_url',
          adapter: 'github',
          github_repo: 'sample github_repo',
          git_branch: 'sample git_branch',
          github_api_token: 'sample git_api_token')
        @token = ApiController::lexicon_server_token(@user, @client_app)
        request.headers['Authorization'] = "Bearer #{@token}"

        allow(Services::Adapters::Lexicon).to receive(:configure).and_return(
          double('sample lexicon adapter',
            read: {},
            write: nil
          ))

        @lexicon_changes[:changes][0][:filename] = 'sample-filename.json'
      end

      it "uses that Clientapp's GitHub access key" do
        expect(Services::Adapters::Lexicon).to receive(:configure).with({
          class: 'github',
          repo: 'sample github_repo',
          branch: 'sample git_branch',
          access_token: 'sample git_api_token'
        })
        put(:update, params: @lexicon_changes)
      end

      it "writes to filename set in ClientApp" do
        lexicon_adapter = Services::Adapters::Lexicon.configure({})
        expect(lexicon_adapter).to receive(:read).with('sample-filename.json')
        expect(lexicon_adapter).to receive(:write).with('sample-filename.json', anything, anything)
        put(:update, params: @lexicon_changes)
      end
    end
  end
end
