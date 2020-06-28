class ThingType < ActiveRecord::Base
  belongs_to :thing
  belongs_to :type

  validates :thing, :type, presence: true

  scope :with_thing_name,    ->{ joins(:thing).select("thing_types.*, things.name as thing_name")}
  scope :with_type_name, ->{ joins(:type).select("thing_types.*, types.name as type_name")}
end
