class Hold
  include Mongoid::Document

  after_create :set_selectable_cells #Create all embedded selectable_cell objects after create
                                     # and give them a selectable attribute of true
  after_update :update_selectable_cells

  field :name, type: String
  field :row_count, type: Integer
  field :column_count, type: Integer

  belongs_to :vessel
  embeds_many :selectable_cells


  private

  def set_selectable_cells

    row_labels = (("A".."AZ").to_a).slice(0..row_count-1)
    col_labels = (1..column_count).to_a


    for i in 1..row_count

      for j in 1..column_count
        this_cell_name = row_labels[i-1]+col_labels[j-1].to_s
        self.selectable_cells.create!( name: this_cell_name, selectable: 'true' )
      end
    end

  end

  def update_selectable_cells
    # Since updating the hold information may have changed the row and column counts,
    # delete the selectable cells and re-run set_selectable_cells

    self.selectable_cells.destroy_all
    set_selectable_cells
  end
end
