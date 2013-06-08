class Pallet
  include Mongoid::Document

  attr_accessible :dest #virtual attribute that concatenates the real attributes destination_code and consignee_code
	attr_accessible :pallet_number 

  field :destination_code, type: Integer  # a one or two digit number
  field :consignee_code, type: String     # one or more capital letters
  field :pallet_number, type: Integer     # 4 digits

  embedded_in :pallet_square

	def dest
		destination_code.to_s+consignee_code.to_s if ( destination_code and consignee_code )
	end

	def dest=(dest_string)
		self.destination_code = dest_string.scan(/\d+/).first if dest_string.present?
		self.consignee_code = dest_string.scan(/[A-Z]/).first if dest_string.present?
	end

end
