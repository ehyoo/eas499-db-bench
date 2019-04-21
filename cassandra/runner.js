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

const generateExecFunctionArray = function generateExecFunctionArray(db, dataSourceFilePath) {
  const load = JSON.parse(fs.readFileSync(dataSourceFilePath));
  const execFunctionArr = load.map((query) => {
    if (query.operation === 'usersByBirthday') {
      return (endCallback) => Queries.usersByBirthday(db,
                                                      query.lowerBound,
                                                      query.upperBound,
                                                      () => endCallback(null, null));
    } else if (query.operation === 'ordersByRange') {
      return (endCallback) => Queries.ordersByRange(db,
                                                   query.customer,
                                                   query.lowerBound,
                                                   query.upperBound,
                                                   () => endCallback(null, null));
    } else if (query.operation === 'recEngine') {
      return (endCallback) => Queries.recEngine(db,
                                               query.customer,
                                               () => endCallback(null, null));
    } else if (query.operation === 'aggregateSpend') {
      return (endCallback) => Queries.aggregateSpend(db,
                                                    query.customer,
                                                    () => endCallback(null, null));
    } else if (query.operation === 'popularity') {
      return (endCallback) => Queries.popularity(db,
                                                query.lowerBound,
                                                query.upperBound,
                                                () => endCallback(null, null));
    } else if (query.operation === 'writeOrder') {
      return (endCallback) => Queries.writeOrder(db,
                                                 query.user,
                                                 query.timestamp,
                                                 query.merchandiseOrdered,
                                                 () => endCallback(null, null));
    } else {
      return null;
    }
  });
  return execFunctionArr;
}

const executeQueries = function executeQueries(db, loadName, dataSourceFilePath, cb) {
  const opArr = generateExecFunctionArray(db, dataSourceFilePath);
  const start = performance.now();
  async.parallelLimit(opArr, 20, (err, res) => {
    const end = performance.now();
    resultDict[loadName] = end - start;
    console.log(`${loadName} done. Took: ${resultDict[loadName]}`);
    cb(null);
  });
}

/**** Mixed Tests ****/

async.waterfall([
  (cb) => executeQueries(db, 'birthdayRun', '../data_generator/workloads/birthday_mixed_load.json', cb),
  (cb) => executeQueries(db, 'ordersByRangeRun', '../data_generator/workloads/orders_mixed_load.json', cb),
  (cb) => executeQueries(db, 'aggregateSpendRun', '../data_generator/workloads/aggregate_spend_mixed_load.json', cb),
  (cb) => executeQueries(db, 'popularityRun', '../data_generator/workloads/popularity_mixed_load.json', cb),
  (cb) => {console.log(resultDict); db.shutdown();}
]);


/**** Read-only Tests ****/

// async.waterfall([
//   (cb) => executeQueries(db, 'birthdayRun', '../data_generator/workloads/birthday_load.json', cb),
//   (cb) => executeQueries(db, 'ordersByRangeRun', '../data_generator/workloads/orders_load.json', cb),
//   (cb) => executeQueries(db, 'aggregateSpendRun', '../data_generator/workloads/aggregate_spend_load.json', cb),
//   (cb) => executeQueries(db, 'popularityRun', '../data_generator/workloads/popularity_load.json', cb),
//   (cb) => {console.log(resultDict); db.shutdown();}
// ]);
