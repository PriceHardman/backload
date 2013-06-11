class SelectableCell
  include Mongoid::Document
  field :name, type: String
  field :selectable, type: String

  embedded_in :hold

end
