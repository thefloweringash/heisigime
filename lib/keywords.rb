require_relative './file_transformer'

require 'json'

class Keywords < FileTransformer[keywords: []]
  def ingest_line!(line)
    kanji, v6frame, v6keyword = line.split(';')
    return if v6frame.empty?
    keywords[Integer(v6frame)] = [kanji, v6keyword]
  end

  def generate
    JSON.generate(keywords[1..2200])
  end
end

Keywords.main(*ARGV)
