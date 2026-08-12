# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

require "json"

Citation.destroy_all # Remove all existing citations to avoid duplicates

# Load the JSON file containing the sample records
json_file_path = Rails.root.join("db", "helix_lab_instruments__p_1000__sample_records.json")

records = JSON.parse(File.read(json_file_path)) # Parse the JSON file into a Ruby array of hashes

# Iterate over each record and create a new Citation record in the database

records.each do |record|
  Citation.create!(
    article_title: record["article_title"],
    journal: record["journal"],
    doi: record["doi"],
    date: record["date"],
    authors: record["authors"],
    short: record["short"],
    long: record["long"]
  )
end

puts "Seeded #{Citation.count} citations from the JSON file"
