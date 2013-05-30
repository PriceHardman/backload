class PalletSquare #represents a pallet square on a load plan
  include Mongoid::Document
  field :name, type: String

  embeds_many :pallets
  belongs_to :cargo_hold
end
