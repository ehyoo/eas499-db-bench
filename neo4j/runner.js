const neo4j = require('neo4j-driver').v1;
const async = require('async');
const fs = require('fs');
const performance = require('perf_hooks').performance;
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'asdfasdf')); // we're just on a localhost.
const db = driver.session();
const Queries = require('./queries.js');

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
      Queries.ordersByRange(db,
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
      Queries.recEngine(db,
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
      Queries.aggregateSpend(db,
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
      Queries.popularity(db,
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

async.waterfall([
  (cb) => runBirthdayQueries(db, cb),
  (cb) => runOrdersByRangeQueries(db, cb),
  (cb) => runRecEngineQueries(db, cb),
  (cb) => runAggregateSpendQueries(db, cb),
  (cb) => runPopularityQueries(db, cb),
  (cb) => {console.log(resultDict); db.close(); driver.close();}
]);
  


