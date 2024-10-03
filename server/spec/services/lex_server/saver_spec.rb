require "rails_helper"

RSpec.describe LexServer::Saver do
  describe "#update_changes" do
    let(:adapter) { spy(read: "fake file contents") }
    let(:saver) { LexServer::Saver.new(adapter) }
    let(:a_json_initial) { { "en" => { "a" => "AA", "foo" => "old foo" } } }
    let(:b_json_initial) { { "o" => "OO" } }

    it "takes list of changes, and sends changes to adapter" do
      allow(adapter).to receive(:read).with("a.json").and_return(a_json_initial)
      allow(adapter).to receive(:read).with("b.json").and_return(b_json_initial)

      changes = [
        { "filename" => "a.json", "key" => "en.foo", "newValue" => "NEW FOO" },
        { "filename" => "a.json", "key" => "en.bar", "newValue" => "NEW BAR" },
        { "filename" => "b.json", "key" => "other", "newValue" => "NEW OTHER" },
      ].freeze
      expect(adapter).to receive(:write_changed_files).with(
        "editor@example.com via Lexicon Editor",
        {
          "a.json" =>
            '{
  "en": {
    "a": "AA",
    "foo": "NEW FOO",
    "bar": "NEW BAR"
  }
}',
          "b.json" =>
            '{
  "o": "OO",
  "other": "NEW OTHER"
}',
        },
      )
      saver.update_changes("editor@example.com", changes)
    end
  end
end
