class Sailing
  include Mongoid::Document

  #Validations:

  #Validate the presence of all the fields:
  [:vessel,:voyage,:direction,:sailing_date].each do |field|
    validates_presence_of field
  end

  #Make sure the direction is N, S, or I:
  validates_format_of :direction, with: /(N|S|I)/

  field :vessel, type: String
  field :voyage, type: Integer
  field :direction, type: String, default: "N"
  field :sailing_date, type: Date

  embeds_many :holds
end
