class User
  include Mongoid::Document
  embeds_one :name
  embeds_many :pets
  has_and_belongs_to_many :friends, class_name: 'User' # This... is going to be interesting
  
  field :birthday, type: Float
end
