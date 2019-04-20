const MongoClient = require('mongodb').MongoClient;
const async = require('async');
const fs = require('fs');
const performance = require('perf_hooks').performance;
const MongoQueries = require('./queries.js');

// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'eas499';
// Create a new MongoClient
const client = new MongoClient(url);

const resultDict = {};

const runBirthdayQueries = function runBirthdayQueries(db, cb) {
	const readOnlyLoad = JSON.parse(
		fs.readFileSync('../data_generator/workloads/birthday_load.json', 'utf8'));
	const opArr = [];

	readOnlyLoad.forEach(query => {
		const execFunction = (endCallback) => {
			MongoQueries.usersByBirthday(db,
																	 query.lowerBound,
																	 query.upperBound,
																	 () => endCallback(null, null));
		}
		opArr.push(execFunction);
	});

	const start = performance.now();
	async.parallel(opArr, (err, res) => {
		const end = performance.now();
		resultDict.birthdayRun = end - start;
		console.log('Birthday queries done. Took: ' + resultDict.birthdayRun);
		cb(null);
	});
};

const runOrdersByRangeQueries = function runOrdersByRangeQueries(db, cb) {
	const readOnlyLoad = JSON.parse(
		fs.readFileSync('../data_generator/workloads/orders_load.json', 'utf8'));
	const opArr = [];

	readOnlyLoad.forEach(query => {
		const execFunction = (endCallback) => {
			MongoQueries.ordersByRange(db,
																 query.customer,
																 query.lowerBound,
																 query.upperBound,
																 () => endCallback(null, null));
		}
		opArr.push(execFunction);
	});

	const start = performance.now();
	async.parallel(opArr, (err, res) => {
		const end = performance.now();
		resultDict.ordersByRangeRun = end - start;
		console.log('Orders by range done. Took: ' + resultDict.ordersByRangeRun);
		cb(null);
	});
};

const runRecEngineQueries = function runRecEngineQueries(db, cb) {
	const readOnlyLoad = JSON.parse(
		fs.readFileSync('../data_generator/workloads/rec_engine_load.json', 'utf8'));
	const opArr = [];

	readOnlyLoad.forEach(query => {
		const execFunction = (endCallback) => {
			MongoQueries.recEngine(db,
														 query.customer,
														 () => endCallback(null, null));
		}
		opArr.push(execFunction);
	});

	const start = performance.now();
	async.parallel(opArr, (err, res) => {
		const end = performance.now();
		resultDict.recEngineRun = end - start;
		console.log('Rec engine done. Took: ' + resultDict.recEngineRun);
		cb(null);
	});
};


const runAggregateSpendQueries = function runAggregateSpendQueries(db, cb) {
	const readOnlyLoad = JSON.parse(
		fs.readFileSync('../data_generator/workloads/aggregate_spend_load.json', 'utf8'));
	const opArr = [];

	readOnlyLoad.forEach(query => {
		const execFunction = (endCallback) => {
			MongoQueries.aggregateSpend(db,
														 			query.customer,
														 			() => endCallback(null, null));
		}
		opArr.push(execFunction);
	});

	const start = performance.now();
	async.parallel(opArr, (err, res) => {
		const end = performance.now();
		resultDict.aggregateSpendRun = end - start;
		console.log('Aggregate spend done. Took: ' + resultDict.aggregateSpendRun);
		cb(null);
	});
};

const runPopularityQueries = function runPopularityQueries(db, cb) {
	const readOnlyLoad = JSON.parse(
		fs.readFileSync('../data_generator/workloads/popularity_load.json', 'utf8'));
	const opArr = [];

	readOnlyLoad.forEach(query => {
		const execFunction = (endCallback) => {
			MongoQueries.popularity(db,
														 	query.lowerBound,
														 	query.upperBound,
														 	() => endCallback(null, null));
		}
		opArr.push(execFunction);
	});

	const start = performance.now();
	async.parallel(opArr, (err, res) => {
		const end = performance.now();
		resultDict.popularityRun = end - start;
		console.log('Popularity done. Took: ' + resultDict.popularityRun);
		cb(null);
	});
}

// Use connect method to connect to the Server
client.connect((err) => {
	  console.log("Connected successfully to server");
	  const db = client.db(dbName);
	  async.waterfall([
	  	(cb) => runBirthdayQueries(db, cb),
	  	(cb) => runOrdersByRangeQueries(db, cb),
	  	(cb) => runRecEngineQueries(db, cb),
	  	(cb) => runAggregateSpendQueries(db, cb),
	  	(cb) => runPopularityQueries(db, cb),
	  	(cb) => {console.log(resultDict); client.close()}
	  ]);
	}
);

