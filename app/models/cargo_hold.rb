class CargoHold  #represents a hold on a load plan, filled with pallet square objects
  include Mongoid::Document

  after_create :create_pallet_squares

  field :name, type: String

  belongs_to :voyage
  has_many :pallet_squares, dependent: :destroy

  private

  def create_pallet_squares
    @vessel = Vessel.find_by(name: self.voyage.vessel)
    @hold = @vessel.holds.find_by(name: name)

    row_labels = (("A".."AZ").to_a).slice(0..@hold.row_count-1)
    col_labels = (1..@hold.column_count).to_a

    for i in 1..@hold.row_count
      for j in 1..@hold.column_count
        this_cell_name = row_labels[i-1]+col_labels[j-1].to_s
        self.pallet_squares.create!( name: this_cell_name )
      end
    end
  end

end
