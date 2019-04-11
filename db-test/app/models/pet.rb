class Pet
  include Mongoid::Document
  embedded_in :user
  field :name, type: String
  field :pet_type, type: String
end
