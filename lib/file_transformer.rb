#!/usr/bin/env ruby

class FileTransformer
  def self.[](attr_map)
    raise 'Single attributes only' unless attr_map.size == 1
    attr_name, attr_default = attr_map.shift

    Class.new(FileTransformer) do
      attr_accessor attr_name

      define_method(:_initialize_attr) do
        self.public_send(:"#{attr_name}=", attr_default)
      end

      def initialize
        super
        _initialize_attr
      end

      define_method(:generate) do
        JSON.generate(self.public_send(attr_name))
      end
    end
  end

  def dump(outfile)
    File.open(outfile, 'w') do |fh|
      fh.puts(self.generate)
    end
  end

  def generate(*)
    raise "Abstract"
  end

  def ingest_file!(filename)
    File.open(filename, 'r') do |fh|
      fh.each_line
        .reject { |l| l =~ /^#/ }
        .each { |line| self.ingest_line!(line.chomp) }
    end
  end

  def self.main(outfile, *infiles)
    self
      .new
      .tap { |db| infiles.each { |f| db.ingest_file!(f) } }
      .dump(outfile)
  end
end
