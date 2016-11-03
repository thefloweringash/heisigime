#!/usr/bin/env ruby

require 'sqlite3'
require 'json'

DECK_ID = '1354697467375'

db = SQLite3::Database.new(ARGV[0])
SEP = "\u001f"

# First field in deck is frame number from the v6 edition (well
# actually the id, but the id and frame number seem to match)
#
# Which you can verify by looking at the flds of the deck
#  "flds":
#  [ {"name": "id", "rtl": false, "sticky": false, "media": [], "ord": 0, "font": "DejaVu Sans", "size": 14}
#  , {"name": "frameNoV4", "rtl": false, "sticky": false, "media": [], "ord": 1, "font": "MS Shell Dlg 2", "size": 14}
#  , {"name": "frameNoV6", "rtl": false, "sticky": false, "media": [], "ord": 2, "font": "MS Shell Dlg 2", "size": 14}
#  , {"name": "keyword", "rtl": false, "sticky": false, "media": [], "ord": 3, "font": "MS Shell Dlg 2", "size": 14}
#  , {"name": "kanji", "rtl": false, "sticky": false, "media": [], "ord": 4, "font": "DejaVu Sans", "size": 26}
#  , {"name": "strokeDiagram", "rtl": false, "sticky": false, "media": [], "ord": 5, "font": "Courier New", "size": 14}

# Fields are stored seperated by a special character
cards = db.execute('select flds from notes where mid=?', DECK_ID).map do |(flds)|
  id, frameNoV4, frameNoV6, keyword, kanji = flds.split(SEP)
  id = id.to_i
  frameNoV4 = frameNoV4.to_i
  frameNoV6 = frameNoV6.to_i
  { id: id, frameNoV4: frameNoV4, frameNoV6: frameNoV6, keyword: keyword, kanji: kanji }
end

puts "export const words = ["
cards.sort_by{|x|x[:frameNoV6]}.each_with_index do |card, i|
  index = i + 1
  unless index == card[:frameNoV6]
    raise "Index doesn't match position, index=#{index} position=#{card[:frameNoV6]}"
  end
  puts "  [#{card[:kanji].to_json}, #{card[:keyword].downcase.to_json}], /* #{card[:frameNoV6]} */"
end
puts "];"
