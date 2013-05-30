class Voyage
  include Mongoid::Document

  attr_accessor :sailing_date_string
  attr_protected :sailing_date

  before_save :set_load_status_and_direction, :parse_date
  after_create :create_cargo_holds

  field :vessel, type: String
  field :voyage_number, type: Integer
  field :sailing_date, type: Time
  field :load_status, type: String
  field :direction
  field :_id, type: String, default: -> { ( vessel_symbol(vessel)+voyage_number.to_s).parameterize }

  has_many :cargo_holds, dependent: :destroy

  private

  def create_cargo_holds
    @this_vessels_holds = Vessel.find_by(name: self.vessel).holds

    @this_vessels_holds.each do |hold|
      self.cargo_holds.create!(name: hold.name)
    end
  end

  def set_load_status_and_direction
    self.load_status = "in_progress"
    self.direction = "N"
  end

  def parse_date #make sure the date is in the right format
    self.sailing_date = Time.strptime( self.sailing_date_string, "%m/%d/%Y")
  end

  def vessel_symbol(vessel_name)
    case vessel_name
      when "Progress"
        "CP"
      when "Nomad"
        "CN"
      when "Navigator"
        "NA"
      when "Trader"
        "TR"
      when "Merchant"
        "ME"
      else
        "S"
    end
  end
end
