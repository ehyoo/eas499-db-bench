'''
This is where our data is going to reside.

We create a test load that resembles something like the following:

User: {
    userId: some incremental id,
    name: {
        first_name: String,
        last_name: String
    },
    birthday: Date,
    friends: [see below],
    pets: [{
        type: 'str',
        name: 'some name'
    }]
}

Within MongoDB: we insert these documents as-is, with friends being a list of IDs
Within Neo4j, we'll model this utilizing two nodes: the User type and the Pet type.
Within Cassandra, we'll model this using userId as our simple primary key, 
    secondary index on Date.
    TODO: This is for you- figure out if you can index into user-types for 
        collections and run efficient queres on them (how many users have pets 
        of type cat?)
'''
import sys
import random
import string
import time
import pickle

##########################################
##### Part 1: getting user arguments #####
##########################################

args = sys.argv
if len(args) < 2:
    print('You need at least one argument.')
    print('Usage: generate_random_load [upper bound] [lower bound]')
    sys.exit()

upper_bound = int(args[1])
lower_bound = 0
if (len(args) > 2):
    lower_bound = int(args[2])

if upper_bound < lower_bound:
    print('Lower bound cannot be higher than upper bound!')
    sys.exit()

#######################################
##### Part 2: Generating our data.#####
#######################################
user_collection = []

def generate_random_string():
    '''
    Generate a random string of length 7 (selected arbitrarily) of letters 
    and numbers
    We use a method proposed here:
    https://pythontips.com/2013/07/28/generating-a-random-string/
    '''
    population = string.ascii_letters + string.digits
    n_rand_selections = [random.choice(population) for _ in range(7)]
    return ''.join(n_rand_selections)

def generate_random_birthday():
    '''
    Generates a random birthday (in the form of milliseconds) between the years 
    1990 and 2000.
    https://stackoverflow.com/questions/553303/generate-a-random-date-between-two-other-dates
    '''
    date_format = '%m/%d/%Y'
    start_time = time.mktime(time.strptime('1/1/1990', date_format))
    end_time = time.mktime(time.strptime('12/31/2000', date_format))
    weight = random.random()
    # our random time is just a weighted average between two points.
    random_time = weight * start_time + (1 - weight) * end_time
    return random_time

def generate_pet_list():
    '''
    Generates a varying list of pets. A user can have anywhere between 0 to 5
    pets.
    '''
    possible_pets = ['cat', 'dog', 'pig', 'pigeon', 'rabbit']
    number_of_pets = random.randint(0, 5)
    pet_collection = []
    for _ in range(number_of_pets):
        pet = {
            'name': generate_random_string(),
            'pet_type': possible_pets[random.randint(0, len(possible_pets)-1)]
        }
        pet_collection.append(pet)
    return pet_collection

for i in range(lower_bound, upper_bound + 1):
    user_i = {}
    user_i['userId'] = i
    user_i['name'] = {
        'first_name': generate_random_string(),
        'last_name': generate_random_string()
    }
    user_i['birthday'] = generate_random_birthday()
    user_i['friends'] = [] # Generate the list of friends on Pass 2.
    user_i['pets'] = generate_pet_list()
    user_collection.append(user_i)
    
    if (i % 10000 == 0):
        print(str(i) + ' generated.')

# Here, we'll guarantee that we have a path from one person to another
# with at least length 4.
friends_deg_0 = [0, 1, 2, 3, 4]
friends_deg_1 = []
friends_deg_2 = []
friends_deg_3 = []
friends_deg_4 = []

friends_deg_matrix = [
    friends_deg_0,
    friends_deg_1,
    friends_deg_2,
    friends_deg_3,
    friends_deg_4
]

used_nodes = set(friends_deg_0)

print('Generating initial friend seed...')
for i in range(0, 4):
    ith_deg = friends_deg_matrix[i]
    ip1th_deg = friends_deg_matrix[i + 1]
    for j in ith_deg:
        curr_user = user_collection[j]
        for k in range(5): # guaranteed 5 friends per user.
            friend = random.randint(lower_bound, upper_bound)
            # Make sure that we're drawing unique nodes per friend.
            if friend not in curr_user['friends'] and friend not in used_nodes:
                curr_user['friends'].append(friend)
                other_user = user_collection[friend]
                other_user['friends'].append(j)
                ip1th_deg.append(friend)
                used_nodes.add(friend)
print('done')

# Final pass: generate friends for each user
print('Randomly generating friends...')
for i in range(lower_bound, upper_bound + 1):
    curr_user = user_collection[i]
    for k in range(3): # 3 friends per
        friend = random.randint(lower_bound, upper_bound)
        if friend not in curr_user['friends']:
            curr_user['friends'].append(friend)
            other_user = user_collection[friend]
            other_user['friends'].append(i)
print('done.')

print('writing....')
# Then, pickle this result.
pickle.dump(user_collection, open('./user_collection.p', 'wb'))
print('Script done. Exiting.')
