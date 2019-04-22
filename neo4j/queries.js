const promiseHelper = function promiseHelper(resultPromise, cb) {
  resultPromise.then(res => {
    // console.log(res);
    cb();
  }).catch(err => {
    console.log(err);
  });
}

const usersByBirthday = function findUsersWithBirthdaysInRange(session, lowerBound, upperBound, callback) {
  const query = 'MATCH (n:User) WHERE $lowerBound < toInteger(n.birthday) < $upperBound return n';
  const queryParameters = {
    lowerBound: lowerBound,
    upperBound: upperBound,
  };
  const resultPromise = session.run(query, queryParameters);
  promiseHelper(resultPromise, callback);
};
  
const ordersByRange = function findOrdersWithTimestampInRange(session, customer, lowerBound, upperBound, callback) {
  let query = 'MATCH (n:User {email: $email})-[:PURCHASED] -> (o:Order) '
              + 'WHERE $lowerBound < toInteger(o.timestamp) < $upperBound '
              + 'RETURN n, o';
  const queryParameters = {
    email: customer,
    lowerBound: lowerBound,
    upperBound: upperBound,
  };
  const resultPromise = session.run(query, queryParameters);
  promiseHelper(resultPromise, callback);
};

const recEngine = function getRecommendedMerchandiseForUser(session, customer, callback) {
  let query = 'MATCH (u:User {email: $email}) -[:PURCHASED]-> (o:Order) -[:CONTAINS]-> (merch:Merchandise) '
              + '<-[:CONTAINS]- (relatedOrder:Order) -[:CONTAINS]-> (relatedMerch:Merchandise) '
              + 'RETURN DISTINCT relatedMerch';
  const queryParameters = {
    email: customer
  };
  const resultPromise = session.run(query, queryParameters);
  promiseHelper(resultPromise, callback);
}

const aggregateSpend = function getAggregateSpendingAmountForUser(session, customer, callback) {
  let query = 'MATCH (u:User {email: $email}) -[:PURCHASED]-> (o:Order) '
              + '-[:CONTAINS]-> (m:Merchandise) return sum(toInteger(m.price))';
  const queryParameters = {
    email: customer
  };
  const resultPromise = session.run(query, queryParameters);
  resultPromise.then(res => {
    // console.log(res.records[0]);
    callback();
  }).catch(err => {
    console.log(err);
  });
}

const popularity = function getTopThreeMostOrderedItemsForTimeRange(session, lowerBound, upperBound, callback) {
  let query = 'MATCH (o:Order) -[c:CONTAINS]-> (m:Merchandise) '
              + 'WHERE $lowerBound < toInteger(o.timestamp) < $upperBound '
              + 'WITH m, count(c) AS numTimesOrdered '
              + 'RETURN m, numTimesOrdered '
              + 'ORDER BY numTimesOrdered DESC '
              + 'LIMIT 3';
  const queryParameters = {
    lowerBound: lowerBound,
    upperBound: upperBound
  };
  const resultPromise = session.run(query, queryParameters);
  resultPromise.then(res => {
    // res.records.forEach((record) => {
    //   console.log(record);
    // });
    callback();
  }).catch(err => {
    console.log(err);
  });
}

const writeOrder = function writeOrder(session, customer, timestamp, merchandiseOrdered, callback) {
  let query = 'CREATE (o:Order {customer: $customer, timestamp: $timestamp}) '
              + 'WITH o '
              + 'MATCH (u:User {email:$customer}) '
              + 'CREATE (u)-[:PURCHASED]->(o) '
              + 'with u, o '
              + 'MATCH (m:Merchandise) WHERE m.merchId IN $merchIdArray '
              + 'CREATE (o)-[:CONTAINS]->(m) '
              + 'RETURN u, o, m';
  const queryParameters = {
    customer,
    timestamp,
    merchIdArray: merchandiseOrdered.map(m => m.id)
  };
  const resultPromise = session.run(query, queryParameters);
  resultPromise.then(res => {
    // res.records.forEach((record) => {
    //   console.log(record);
    // });
    callback();
  }).catch(err => {
    console.log(err);
  });
}

module.exports = {
  usersByBirthday,
  ordersByRange,
  recEngine,
  aggregateSpend,
  popularity,
  writeOrder
};
