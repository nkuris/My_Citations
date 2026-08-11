class CreateCitations < ActiveRecord::Migration[7.2]
  def change
    create_table :citations do |t|
      t.string :article_title
      t.string :journal
      t.string :doi
      t.date :date
      t.json :authors
      t.text :short
      t.text :long

      t.timestamps
    end
  end
end
