Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  get '/test', to: 'user#test'
  post '/users/new', to: 'user#create'
  post '/users/add_friends', to: 'user#add_friends'
end
