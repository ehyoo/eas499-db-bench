class Name
  include Mongoid::Document
  embedded_in :user
  field :first_name, type: String
  field :last_name, type: String
end
