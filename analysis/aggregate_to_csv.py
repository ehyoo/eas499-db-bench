import json
import os
import pandas as pd

dirs = ['cassandra', 'neo4j', 'mongodb']
filenames = ['read_only_results.txt', 'mixed_results.txt']

data = []

for db_dir in dirs:
	for filename in filenames:
		filepath = os.path.join('..', db_dir, filename)
		data_arr = json.load(open(filepath, 'r'))
		for single_test_dict in data_arr:
			single_test_dict['database'] = db_dir
			single_test_dict['test_type'] = 'read_only' if filename == 'read_only_results.txt' else 'mixed'
			data.append(single_test_dict)

pd.DataFrame(data).to_csv('./tests.csv', index=False)


