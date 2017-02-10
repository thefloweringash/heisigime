require_relative './file_transformer'

require 'json'

class Keywords < FileTransformer
  attr_reader :keywords

  def initialize
    @keywords = []
  end

  def ingest_line!(line)
    kanji, v6frame, v6keyword = line.split(';')
    return if v6frame.empty?
    v6frame = Integer(v6frame)
    keywords[v6frame] = [kanji, v6keyword]
  end

  def generate
    JSON.generate(keywords[1..2200])
  end
end

Keywords.main(*ARGV)