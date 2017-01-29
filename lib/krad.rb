require_relative './file_transformer'

require 'json'

class KRAD < FileTransformer
  attr_reader :kanji_contents

  def initialize
    @kanji_contents = {}
  end

  def ingest_file!(filename)
    File.open(filename, 'r') do |fh|
      fh.each_line
        .reject { |l| l =~ /^#/ }
        .each { |line| self.ingest_line!(line) }
    end
  end

  def ingest_line!(kradfile_line)
    kanji, _separator, *radicals = kradfile_line.split(' ')
    kanji_contents[kanji] = radicals
  end

  def generate
    JSON.generate(kanji_contents)
  end
end

KRAD.main(*ARGV)
