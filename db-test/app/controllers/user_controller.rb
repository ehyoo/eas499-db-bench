class UserController < ApplicationController
    def test
        user = User.create(birthday: 1, user_id: 'asdf')
        user.create_name(first_name: 'Joe', last_name: 'Test')
        pet = Pet.new(name: 'pet', pet_type: 'dog')
        user.pets << pet

        user2 = User.create(birthday: 2, user_id: 'meme')
        user2.create_name(first_name: 'Sally', last_name: 'Test')
        pet2 = Pet.new(name: 'pet', pet_type: 'cat')
        user2.pets << pet2

        user.friends = [user2]
        user2.friends = [user]
        user
    end

    def create
    end
end
