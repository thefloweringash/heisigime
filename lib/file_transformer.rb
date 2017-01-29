#!/usr/bin/env ruby

class FileTransformer
  def dump(outfile)
    File.open(outfile, 'w') do |fh|
      fh.puts(self.generate)
    end
  end

  def generate(*)
    raise "Abstract"
  end

  def ingest_file!(*)
    raise "Abstract"
  end

  def self.main(outfile, *infiles)
    self
      .new
      .tap { |db| infiles.each { |f| db.ingest_file!(f) } }
      .dump(outfile)
  end
end
