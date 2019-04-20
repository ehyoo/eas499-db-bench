// starter code from https://neo4j.com/developer/javascript/

const neo4j = require('neo4j-driver').v1;

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'asdfasdf')); // we're just on a localhost.
const session = driver.session();

const usersByBirthday = function findUsersWithBirthdaysInRange(lowerBound, upperBound, callback) {
  const query = 'MATCH (n:User) WHERE $lowerBound < toInteger(n.birthday) < $upperBound return n';
  const queryParameters = {
    lowerBound: lowerBound,
    upperBound: upperBound,
  };
  const resultPromise = session.run(query, queryParameters);
  resultPromise.then(res => {
    console.log(res);
    session.close();
    callback();
  }).catch(err => {
    console.log(err);
  });
};
  
  // find orders between ... and ...

const ordersByRange = function findOrdersWithTimestampInRange(customer, lowerBound, upperBound, callback) {
  let query = 'MATCH (n:User {email: $email})-[:PURCHASED] -> (o:Order) ';
  query = query + 'WHERE $lowerBound < toInteger(o.timestamp) < $upperBound ';
  query = query + 'RETURN n, o';
  const queryParameters = {
    email: customer,
    lowerBound: lowerBound,
    upperBound: upperBound,
  };
  const resultPromise = session.run(query, queryParameters);
  resultPromise.then(res => {
    console.log(res);
    session.close();
    callback();
  }).catch(err => {
    console.log(err);
  });
};

// rec engine: for a user, query what other items they have given what they bought.
const recEngine = function getRecommendedMerchandiseForUser(customer, callback) {
  let query = 'MATCH (u:User {email: $email}) -[:PURCHASED]-> (o:Order) -[:CONTAINS]-> (merch:Merchandise) '
  query = query + '<-[:CONTAINS]- (relatedOrder:Order) -[:CONTAINS]-> (relatedMerch:Merchandise) '
  query = query + 'RETURN DISTINCT relatedMerch'
  const queryParameters = {
    email: customer
  };
  const resultPromise = session.run(query, queryParameters);
  resultPromise.then(res => {
    console.log(res);
    console.log(res.records.length);
    callback();
  }).catch(err => {
    console.log(err);
  });
}

// usersByBirthday(818125896, 818135996, () => driver.close());
// ordersByRange('jLHbGPug00', 1535060020, 1555060320, () => driver.close());
recEngine('jLHbGPug00', () => driver.close());
