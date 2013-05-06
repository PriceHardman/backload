class Vessel
  include Mongoid::Document


  field :name, type: String
  field :_id, type: String, default: -> {name.to_s.parameterize}

  has_many :holds, autosave: true, dependent: :destroy

end
