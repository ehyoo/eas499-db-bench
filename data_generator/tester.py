import requests
import pickle
import time

# This script hits our 

endpoint = 'http://localhost:3000/users/seed'
data_list = pickle.load(open('user_collection.p', 'rb'))


def send_random_id_request():
    # we're doing deterministic for... reasons.
    user_id = 1
    endpoint = 'http://localhost:3000/users/show/' + str(user_id)
    r = requests.get(url=endpoint)
    print(r.json())

def send_random_birthday_request():
    lb = 691893484 # make this random
    ub = 710000000 # This too
    endpoint = 'http://localhost:3000/users/birthdays?lb=' + str(lb) + '&' + 'ub=' + str(ub)
    print(endpoint)
    r = requests.get(url=endpoint)
    print(r.json())

def send_random_pets_request():
    pet = 'dog'
    endpoint = 'http://localhost:3000/users/pets/' + pet
    r = requests.get(url=endpoint)
    print(r.json())

send_random_pets_request()
        

    
