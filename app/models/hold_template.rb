class HoldTemplate
  include Mongoid::Document

  after_validation :set_selectable_cells #until the user defines the selectable cells, none of them will be selectable.
  #This method runs once the object is created, and makes an array of zeroes.

  field :vessel, type: String
  field :hold, type: String
  field :row_count, type: Integer
  field :column_count, type: Integer
  field :selectable_cells, type: Array

  private

  def set_selectable_cells
    array_length = self.row_count * self.column_count
    array = (1..array_length).inject([]){|collection,element| collection<<0}
    self.selectable_cells = array
  end
end
