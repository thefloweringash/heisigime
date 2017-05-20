require_relative './file_transformer'

require 'json'

class KRAD < FileTransformer[kanji_contents: {}]
  def ingest_line!(kradfile_line)
    kanji, _separator, *radicals = kradfile_line.split(' ')

    kanji_contents[kanji] = radicals
  end
end

KRAD.main(*ARGV)
