class Pallet
  include Mongoid::Document

  attr_accessor :dest

  field :destination_code, type: Integer
  field :consignee, type: String
  field :pallet_number, type: Integer

  embedded_in :pallet_square
end
