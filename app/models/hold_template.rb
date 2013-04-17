class HoldTemplate
  include Mongoid::Document

  field :vessel, type: String
  field :hold, type: String
  field :row_count, type: Integer
  field :column_count, type: Integer
  field :selectable_cells, type: Array
end
