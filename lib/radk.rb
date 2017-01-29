require_relative './file_transformer'

require 'json'

class RADK < FileTransformer
  attr_reader :radical_contents

  def initialize
    @radical_strokes  = {}
    @radical_contents = {}
  end

  def ingest_file!(filename)
    File.open(filename, 'r') do |fh|
      fh.each_line
        .reject { |l| l =~ /^#/ }
        .each { |line| self.ingest_line!(line) }
    end
    finish_radical!
  end

  def ingest_line!(kradfile_line)
    case
    when kradfile_line =~ /^\$/
      finish_radical!

      # new radical
      _dollars, radical, strokes = kradfile_line.split(' ')
      (@radical_strokes[strokes] ||= []) << radical

      @current_radical  = radical
      @partial_contents = []
    else
      unless @partial_contents
        raise "Unexpected contents: #{kradfile_line}"
      end

      # contents of radical
      @partial_contents.push(*kradfile_line.chomp.split(''))
    end
  end

  def finish_radical!
    if @partial_contents
      @radical_contents[@current_radical] = @partial_contents
      @partial_contents                   = nil
    end
  end

  def generate
    JSON.generate({
                    strokes:  @radical_strokes,
                    contents: radical_contents
                  })
  end
end

RADK.main(*ARGV)
