class CreateThingTypes < ActiveRecord::Migration
  def change
    create_table :types do |t|
      t.string :name, {null: false}

      t.timestamps null: false
    end

    create_table :thing_types do |t|
      t.references :thing, index: true, foreign_key: true, null: false
      t.references :type, index: true, foreign_key: true, null: false

      t.timestamps null: false
    end

    add_index :thing_types, [:thing_id, :type_id], unique: true
  end
end
