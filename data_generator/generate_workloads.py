import random
import string
import time
import json
import numpy as np

random.seed(21) # Deterministic output
np.random.seed(21)

### Parameters
num_ops_per_load = 100 # We'll do 100 calls per test.
mixed_test_read_proportion = 0.8 # 80% of our "mixed" workload are reads.
lambda_merch_in_order = 2

### Data Structures
birthday_load = []
birthday_mixed_load = []
orders_load = []
orders_mixed_load = []
rec_engine_load = []
rec_engine_mixed_load = []
aggregate_spend_load = []
aggregate_spend_mixed_load = []
popularity_load = []
popularity_mixed_load = []

### Loading in necessary data
print('Loading in necessary seeded data...')
users_collection = json.load(open('./data/users.json'))
merchandise_collection = json.load(open('./data/merchandise.json'))
print('Done.')

### Helper Methods
def generate_random_timestamp(start='1/1/1990', end='12/31/2000'):
	# NOTE: we may want to refactor this for DRY reasons 
    date_format = '%m/%d/%Y'
    start_time = time.mktime(time.strptime(start, date_format))
    end_time = time.mktime(time.strptime(end, date_format))
    weight = random.random()
    # our random time is just a weighted average between two points.
    random_time = int(weight * start_time + (1 - weight) * end_time)
    return random_time

def generate_random_birthday_read():
	delta = 7884000 # approximately 3 months in seconds
	start_date = generate_random_timestamp()
	end_date = start_date + delta
	read_operation = {
		'operation': 'usersByBirthday',
		'lowerBound': start_date, # using camel case for javascript.
		'upperBound': end_date
	}
	return read_operation

def generate_random_order_read():
	delta = 7884000
	random_user = random.choice(users_collection)
	start_date = generate_random_timestamp(start='1/1/2016', end='5/1/2019')
	end_date = start_date + delta
	read_operation = {
		'operation': 'ordersByRange',
		'customer': random_user['email'],
		'lowerBound': start_date,
		'upperBound': end_date
	}
	return read_operation

def generate_random_rec_engine_read():
	random_user = random.choice(users_collection)
	read_operation = {
		'operation': 'recEngine',
		'customer': random_user['email']
	}
	return read_operation

def generate_aggregate_spend_read():
	random_user = random.choice(users_collection)
	read_operation = {
		'operation': 'aggregateSpend',
		'customer': random_user['email']
	}
	return read_operation

def generate_popularity_read():
	delta = 7884000
	start_date = generate_random_timestamp(start='1/1/2016', end='5/1/2019')
	end_date = start_date + delta
	read_operation = {
		'operation': 'popularity',
		'lowerBound': start_date,
		'upperBound': end_date
	}
	return read_operation

def generate_order_write():
	random_user = random.choice(users_collection)
	timestamp = generate_random_timestamp(start='5/1/2019', end='12/31/2019')
	num_merch =  np.random.poisson(lam=lambda_merch_in_order) + 1
	merchandise_ordered = random.sample(merchandise_collection, k=num_merch)
	write_operation = {
		'operation': 'writeOrder',
		'user': random_user['email'],
		'timestamp': timestamp,
		'merchandiseOrdered': merchandise_ordered
	}
	return write_operation


### Generating the pure read workloads
print('Generating the pure read workloads...')
for i in range(num_ops_per_load):
	birthday_load.append(generate_random_birthday_read())
	orders_load.append(generate_random_order_read())
	rec_engine_load.append(generate_random_rec_engine_read())
	aggregate_spend_load.append(generate_aggregate_spend_read())
	popularity_load.append(generate_popularity_read())
print('Done.')

print('Generating the mixed workloads...')
for i in range(num_ops_per_load):
	flip = random.random()
	if flip < mixed_test_read_proportion:
		birthday_mixed_load.append(generate_random_birthday_read())
		orders_mixed_load.append(generate_random_order_read())
		rec_engine_mixed_load.append(generate_random_rec_engine_read())
		aggregate_spend_mixed_load.append(generate_aggregate_spend_read())
		popularity_mixed_load.append(generate_popularity_read())
	else:
		birthday_mixed_load.append(generate_order_write())
		orders_mixed_load.append(generate_order_write())
		rec_engine_mixed_load.append(generate_order_write())
		aggregate_spend_mixed_load.append(generate_order_write())
		popularity_mixed_load.append(generate_order_write())
print('Done.')

print('Writing to disk...')
all_workloads = [
	birthday_load,
	birthday_mixed_load,
	orders_load,
	orders_mixed_load,
	rec_engine_load,
	rec_engine_mixed_load,
	aggregate_spend_load,
	aggregate_spend_mixed_load,
	popularity_load,
	popularity_mixed_load
]
all_filenames = [
	'birthday_load.json',
	'birthday_mixed_load.json',
	'orders_load.json',
	'orders_mixed_load.json',
	'rec_engine_load.json',
	'rec_engine_mixed_load.json',
	'aggregate_spend_load.json',
	'aggregate_spend_mixed_load.json',
	'popularity_load.json',
	'popularity_mixed_load.json'
]

for i in range(len(all_workloads)):
	curr_workload = all_workloads[i]
	curr_filename = all_filenames[i]
	with open('./workloads/' + curr_filename, 'w+') as f:
		json.dump(curr_workload, f)

print('Done.')
