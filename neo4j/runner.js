// Starter code from https://neo4j.com/developer/javascript/

const neo4j = require('neo4j-driver').v1;
const async = require('async');
const fs = require('fs');
const performance = require('perf_hooks').performance;
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'asdfasdf')); // we're just on a localhost.
const db = driver.session();
const Queries = require('./queries.js');

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
  async.parallel(opArr, (err, res) => {
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
  (cb) => executeQueries(db, 'recEngineRun', '../data_generator/workloads/rec_engine_mixed_load.json', cb),
  (cb) => executeQueries(db, 'aggregateSpendRun', '../data_generator/workloads/aggregate_spend_mixed_load.json', cb),
  (cb) => executeQueries(db, 'popularityRun', '../data_generator/workloads/popularity_mixed_load.json', cb),
  (cb) => {console.log(resultDict); db.close(); driver.close();}
]);


/**** Read-only Tests ****/

// async.waterfall([
//   (cb) => executeQueries(db, 'birthdayRun', '../data_generator/workloads/birthday_load.json', cb),
//   (cb) => executeQueries(db, 'ordersByRangeRun', '../data_generator/workloads/orders_load.json', cb),
//   (cb) => executeQueries(db, 'recEngineRun', '../data_generator/workloads/rec_engine_load.json', cb),
//   (cb) => executeQueries(db, 'aggregateSpendRun', '../data_generator/workloads/aggregate_spend_load.json', cb),
//   (cb) => executeQueries(db, 'popularityRun', '../data_generator/workloads/popularity_load.json', cb),
//   (cb) => {console.log(resultDict); db.close(); driver.close();}
// ]);




