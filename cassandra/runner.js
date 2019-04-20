// starter code from https://github.com/datastax/nodejs-driver]
// and https://academy.datastax.com/units/getting-started-apache-cassandra-and-nodejs?resource=getting-started-apache-cassandra-and-nodejs

const fs = require('fs');
const performance = require('perf_hooks').performance;
const Queries = require('./queries.js');
const cassandra = require('cassandra-driver');
const async = require('async');

const db = new cassandra.Client({
  localDataCenter: 'datacenter1',
  contactPoints: ['127.0.0.1'],
  keyspace: 'eas499'
});

// Cassandra behaves very poorly with traditional async, cascading in all failures.
// So, instead of using our async.parallel method, we have to batch our queries, hence 
// utilizing async.parallelLimit instead of plain async.parallel

const resultDict = {};

const runBirthdayQueries = function runBirthdayQueries(db, cb) {
  const readOnlyLoad = JSON.parse(
    fs.readFileSync('../data_generator/workloads/birthday_load.json', 'utf8'));
  const opArr = [];
  readOnlyLoad.forEach(query => {
    const execFunction = (endCallback) => {
      Queries.usersByBirthday(db,
                             query.lowerBound,
                             query.upperBound,
                             () => endCallback(null, null));
    }
    opArr.push(execFunction);
  });

  const start = performance.now();
  for (let i = 1; i < 6; i++) {

  }
  async.parallelLimit(opArr, 20, (err, res) => {
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
      Queries.ordersByRange(db,
                           query.customer,
                           query.lowerBound,
                           query.upperBound,
                           () => endCallback(null, null));
    }
    opArr.push(execFunction);
  });

  const start = performance.now();
  async.parallelLimit(opArr, 20, (err, res) => {
    const end = performance.now();
    resultDict.ordersByRangeRun = end - start;
    console.log('Orders by range done. Took: ' + resultDict.ordersByRangeRun);
    cb(null);
  });
};

const runAggregateSpendQueries = function runAggregateSpendQueries(db, cb) {
  const readOnlyLoad = JSON.parse(
    fs.readFileSync('../data_generator/workloads/aggregate_spend_load.json', 'utf8'));
  const opArr = [];

  readOnlyLoad.forEach(query => {
    const execFunction = (endCallback) => {
      Queries.aggregateSpend(db,
                             query.customer,
                             () => endCallback(null, null));
    }
    opArr.push(execFunction);
  });

  const start = performance.now();
  async.parallelLimit(opArr, 20, (err, res) => {
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
      Queries.popularity(db,
                               query.lowerBound,
                               query.upperBound,
                               () => endCallback(null, null));
    }
    opArr.push(execFunction);
  });

  const start = performance.now();
  async.parallelLimit(opArr, 20, (err, res) => {
    const end = performance.now();
    resultDict.popularityRun = end - start;
    console.log('Popularity done. Took: ' + resultDict.popularityRun);
    cb(null);
  });
}


async.waterfall([
  (cb) => runBirthdayQueries(db, cb),
  (cb) => runOrdersByRangeQueries(db, cb),
  (cb) => runAggregateSpendQueries(db, cb),
  (cb) => runPopularityQueries(db, cb),
  (cb) => {console.log(resultDict); db.shutdown()}
]);


// usersByBirthday(818125896, 818135996, () => client.shutdown());
// ordersByRange('jLHbGPug00', 0, 1545616608, () => client.shutdown());
// recEngine('jLHbGPug00', () => client.shutdown());
// aggregateSpend('jLHbGPug00', () => client.shutdown());
// popularity(1511560866, 1522660866, () => client.shutdown());
