import random
import string
import time
import json
import numpy as np
import pandas as pd

##########################
## Parameters and Setup ##
##########################

random.seed(15) # Deterministic output
np.random.seed(15)

# Data Structures
users_collection = []
merchandise_collection = []
orders_collection = []

### Parameters
num_users = 100000
# Latent state of user
threshhold = 0.2 # 20% of our users are merchants.
# Poisson parameters
lambda_merch_offered = 10 # num. merch offered ~ Poisson
lambda_number_orders_per_user = 5 # num. orders per user ~ Poisson
lambda_merch_in_order = 2 # number of merchandise for an order ~ Poisson
# Gamma parameters
merch_shape = 10
merch_scale = 3

#############
## Methods ##
#############
def generate_random_string(str_len=7):
    '''
    Generate a random string of some length of letters and numbers
    We use a method proposed here:
    https://pythontips.com/2013/07/28/generating-a-random-string/
    '''
    population = string.ascii_letters + string.digits
    n_rand_selections = [random.choice(population) for _ in range(str_len)]
    return ''.join(n_rand_selections)

def generate_random_timestamp(start='1/1/1990', end='12/31/2000'):
    '''
    Generates a random timestamp in millis
    https://stackoverflow.com/questions/553303/generate-a-random-date-between-two-other-dates
    '''
    date_format = '%m/%d/%Y'
    start_time = time.mktime(time.strptime(start, date_format))
    end_time = time.mktime(time.strptime(end, date_format))
    weight = random.random()
    # our random time is just a weighted average between two points.
    random_time = int(weight * start_time + (1 - weight) * end_time)
    return random_time

def create_new_user():
    '''
    Generates a user with the following structure:
    {
        email: str
        firstName: str
        lastName: str
        birthday: long that represents date between 1/1/1990-12/31/2000
        listedMerch: [id of merch]
    }
    '''
    user_obj = {}
    user_obj['email'] = generate_random_string(str_len=10)
    user_obj['firstName'] = generate_random_string()
    user_obj['lastName'] = generate_random_string()
    user_obj['birthday'] = generate_random_timestamp()
    user_obj['listedMerch'] = []
    return user_obj

def create_new_merch():
    '''
    Generates a Merchandise dictionary with the following structure:
    {
        id: str
        price: Random number selected from the Gamma distribution (shape 10, scale 3)
    }
    '''
    merchandise_obj = {}
    merchandise_obj['id'] = generate_random_string(str_len=10)
    merchandise_obj['price'] = round(np.random.gamma(shape=merch_shape, scale=merch_scale), 2)
    return merchandise_obj

def create_new_order(customer_email, merch_list):
    '''
    Generates a Order dictionary with the following structure:
    {
        customer: str
        timestamp: long that represents a date between 1/1/2016-5/1/2019 (range selected arbitrarily)
        merchandiseOrdered: [{merchandise object}]
    }
    We embed merchandise ordered to represent a "snapshot" of the order. One can imagine that a 
    merchant would update their listings, but that should not change what the user ordered. 
    '''
    order_obj = {}
    order_obj['customer'] = customer_email
    order_obj['timestamp'] = generate_random_timestamp(start='1/1/2016', end='5/1/2019')
    order_obj['merchandiseOrdered'] = merch_list 
    return order_obj

def generate_merchandise_list(num_to_generate):
    generated_list = []
    for i in range(num_to_generate):
        merch = create_new_merch()
        merchandise_collection.append(merch)
        generated_list.append(merch)
    return generated_list

def generate_orders_for_user(customer_email, num_orders):
    for i in range(num_orders):
        num_merch_in_order = np.random.poisson(lam=lambda_merch_in_order) + 1
        merch_in_order = random.sample(merchandise_collection, k=num_merch_in_order)
        order = create_new_order(customer_email, merch_in_order)
        orders_collection.append(order)

###############
## Generator ##
###############
# First pass: generate both users and merchandise
# Generate users, then determine if the user is a merchant by pulling a number from the 
# uniform and checking if it's below 0.2. 
# If so, pull a number from poisson(10) and add 1, and generate this number of merchandise.
print('Executing first pass: generating users and merchandise...')
for i in range(num_users):
    user = create_new_user()
    flip = random.random()
    if flip < threshhold: # user is a merchant
        # number of merchandise offered is modeled by the poisson with lambda=10
        # offset by + 1 so every merchant offers at least one item.
        num_merch_offered = np.random.poisson(lam=lambda_merch_offered) + 1 
        merch_arr = generate_merchandise_list(num_merch_offered)
        user['listedMerch'] = list(map(lambda item: item['id'], merch_arr))
    if i % 1000 == 0:
        print(i)
    users_collection.append(user)
print('Done.')

# Second pass, generate orders
# for each user, generate a number from Poisson(5)
# Then, for each order, generate a number from (Poisson(2) + 1)
print('Executing second pass: generating orders....')
for i in range(num_users):
    curr_user = users_collection[i]
    num_orders = np.random.poisson(lam=lambda_number_orders_per_user)
    generate_orders_for_user(curr_user['email'], num_orders)
    if i % 1000 == 0:
        print(i)
print('Done.')

print('Generated ' + str(len(users_collection)) + \
    ' users, ' + str(len(merchandise_collection)) + \
    ' lineitems, and ' + str(len(orders_collection)) + ' orders.')

print('Writing data...')

with open('./data/users.json', 'w+') as f:
    json.dump(users_collection, f)

with open('./data/merchandise.json', 'w+') as f:
    json.dump(merchandise_collection, f)

with open('./data/orders.json', 'w+') as f:
    json.dump(orders_collection, f)

print('Writing data to CSV...')
pd.read_json('./data/users.json',
              orient='records')\
                  .to_csv('./data/users.csv', index=False)
pd.read_json('./data/merchandise.json',
             orient='records',
             convert_dates=False)\
                 .to_csv('./data/merchandise.csv', index=False)
pd.read_json('./data/orders.json',
             orient='records',
             convert_dates=False)\
                 .to_csv('./data/orders.csv', index=False)

# Then "flatten" our orders for ease of insertion for Cassandra and Neo4j
# That is, make each combination of (customer, timestamp, merchandise in order) a row,
# instead of nesting all the merchandise in a single row
expanded = []
for order in orders_collection:
    for merch in order['merchandiseOrdered']:
        newOrder = {
            'customer': order['customer'],
            'timestamp': order['timestamp'],
            'merchandiseId': merch['id']
        }
        expanded.append(newOrder)

# First the entire data set (for Cassandra)
pd.DataFrame(expanded).to_csv('./data/orders_flattened.csv', index=False)
# Then we break this up so Neo4j doesn't go berserk.
pd.DataFrame(expanded[:250000]).to_csv('./data/orders_flattened_1.csv', index=False)
pd.DataFrame(expanded[250000:500000]).to_csv('./data/orders_flattened_2.csv', index=False)
pd.DataFrame(expanded[500000:750000]).to_csv('./data/orders_flattened_3.csv', index=False)
pd.DataFrame(expanded[750000:1000000]).to_csv('./data/orders_flattened_4.csv', index=False)
pd.DataFrame(expanded[1000000:1250000]).to_csv('./data/orders_flattened_5.csv', index=False)
pd.DataFrame(expanded[1250000:]).to_csv('./data/orders_flattened_6.csv', index=False)
print('Script done.')

