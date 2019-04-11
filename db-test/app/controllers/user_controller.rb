class UserController < ApplicationController
    def test
        user = User.create(birthday: 1, _id: 'something else')
        user.create_name(first_name: 'Joe', last_name: 'Test')
        pet = Pet.new(name: 'pet', pet_type: 'dog')
        user.pets << pet

        user2 = User.create(birthday: 2, _id: 'something')
        user2.create_name(first_name: 'Sally', last_name: 'Test')
        pet2 = Pet.new(name: 'pet', pet_type: 'cat')
        user2.pets << pet2

        user.friends = [user2]
        user2.friends = [user]
        user
    end

    def create
        user = User.create(birthday: params[:birthday], _id: params[:userId])
        print('\n\n\n name')
        print(params[:name])
        user.create_name(first_name: params[:name]['first_name'], last_name: params[:name]['last_name'])
        pet_arr = []
        params[:pets].each do |pet|
            pet = Pet.new(name: pet['name'],
                          pet_type: pet['pet_type'])
            pet_arr << pet
        end
        user.pets = pet_arr
        user.friends = []
        render json: params
    end

    def add_friends
    end
end
