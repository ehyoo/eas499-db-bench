import requests
import pickle
import time

# This script hits our 

endpoint = 'http://localhost:3000/users/new'
data_list = pickle.load(open('user_collection.p', 'rb'))

for i in range(11451, len(data_list)):
    not_sent = True
    data = data_list[i]
    while not_sent:
        try:
            r = requests.post(url=endpoint, json=data)
            not_sent = False
            print(str(i) + " completed.")
        except requests.exceptions.ConnectionError:
            print("Trying again for " + str(i))
            pass
        
        
    
