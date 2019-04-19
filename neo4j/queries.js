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
  // const query = 'MATCH (n:User {email: $email})-[:'
};

// rec engine: for a user, query what other items they have given what they bought.
const recEngine = function getRecommendedMerchandiseForUser(db, userId) {
}

usersByBirthday(818125896, 818135996, () => driver.close());
