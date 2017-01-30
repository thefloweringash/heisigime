require_relative './file_transformer'

require 'json'

class Radicals < FileTransformer
  attr_reader :radicals

  def initialize
    @radicals = {}
  end

  def ingest_line!(line)
    radical, strokes = line.split(':')
    radicals[radical] = strokes
  end

  def generate
    JSON.generate(radicals)
  end
end

Radicals.main(*ARGV)
