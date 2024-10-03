require "rails_helper"

RSpec.describe "Ruby Lexicon" do
  describe "loading" do
    it "loads `.json` files" do
      strings_file = Tempfile.open(%w[lexicon .json])
      strings_file.write '{ "en": { "foo": "FOO" } }'
      strings_file.close

      expect(Lexicon.new(strings_file.path).get("foo")).to eq("FOO")
    end

    it "loads `.yml` files" do
      strings_file = Tempfile.open(%w[lexicon .yml])
      strings_file.write <<~QUOTE
        en:
          foo: FOO
      QUOTE
      strings_file.close

      expect(Lexicon.new(strings_file.path).get("foo")).to eq("FOO")
    end

    it "loads `.yaml` files" do
      strings_file = Tempfile.open(%w[lexicon .yaml])
      strings_file.write <<~QUOTE
        en:
          foo: FOO
      QUOTE
      strings_file.close

      expect(Lexicon.new(strings_file.path).get("foo")).to eq("FOO")
    end
  end

  describe "#get" do
    before do
      strings_file = Tempfile.open(%w[lexicon .yml])
      strings_file.write <<~QUOTE
        en:
          title: The Title
          foo:
            bar: This is a bar
      QUOTE
      strings_file.close

      @lexicon = Lexicon.new(strings_file.path)
    end

    it "returns strings with simple key" do
      expect(@lexicon.get("title")).to eq("The Title")
    end

    it "returns strings with dotted key" do
      expect(@lexicon.get("foo.bar")).to eq("This is a bar")
    end
  end
end
