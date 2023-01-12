require 'rails_helper'

RSpec.describe 'Settings' do
  before(:all) do
    open('/tmp/preferences_spec.yml', 'wt') do |f|
      f.write('
production:
  foo: "FOO" ')
    end
  end

  subject { Settings.new('/tmp/preferences_spec.yml', 'production') }

  describe '.fetch' do
    it 'returns value in YML file' do
      expect(subject.fetch(:foo)).to eq('FOO')
    end

    it 'value from ENV variable overrides YML file' do
      ENV['foo'] = 'FOO_FROM_ENV'
      expect(subject.fetch(:foo)).to eq('FOO_FROM_ENV')
      ENV.delete('foo')
    end

    it 'returns fallback if nowhere to be found' do
      expect(subject.fetch(:bar, 'BAR')).to eq('BAR')
    end

    it 'raises an error when value not found and there is no fallback' do
      expect { subject.fetch(:bar) }.to raise_error
    end
  end
end
