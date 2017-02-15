require_relative './file_transformer'

require 'json'

class Radicals < FileTransformer[radicals: {}]
  def ingest_line!(line)
    radical, strokes = line.split(':')
    radicals[radical] = strokes
  end
end

Radicals.main(*ARGV)
