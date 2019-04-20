// starter code from https://github.com/datastax/nodejs-driver]
// and https://academy.datastax.com/units/getting-started-apache-cassandra-and-nodejs?resource=getting-started-apache-cassandra-and-nodejs
const cassandra = require('cassandra-driver');
const async = require('async');

const client = new cassandra.Client({
  localDataCenter: 'datacenter1',
  contactPoints: ['127.0.0.1'],
  keyspace: 'eas499'
});

const usersByBirthday = function findUsersWithBirthdaysInRange(lowerBound, upperBound, cb) {
  // Note that, to execute this, we have to utilize "ALLOW FILTERING"
  // Why? https://www.datastax.com/dev/blog/allow-filtering-explained-2
  // Cassandra in the backend retrieves all the rows, then filters out the ones that aren't desired. So, 
  // obviously, this does not leverage Cassandra's strengths, though it does allow us to execute our queries. 
  const query = 'SELECT * FROM users WHERE birthday < ? AND birthday > ? ALLOW FILTERING';
  client.execute(query, [upperBound, lowerBound], {prepare: true}).then(res => {
    console.log(res);
    cb();
  });
};

const ordersByRange = function findOrdersWithTimestampInRange(customer, lowerBound, upperBound, cb) {
  const query = 'SELECT * FROM orders WHERE customer = ? AND timestamp < ? AND timestamp > ?';
  client.execute(query, [customer, upperBound, lowerBound], {prepare: true}).then(res => {
    console.log(res);
    cb();
  }); 
};


/**
 * Abandoned code for the recommendation engine for Cassandra.
 * From our currently defined data model, Cassandra does not lend itself to graph traversal
 * unless we do some very unorthodox things, which at that point would defeat the purpose 
 * of a "fair" query testing.
 * 
 * See thesis for reasoning for why this is the case.  
 */

// const recEngine = function getRecommendedMerchandiseForUser(customer, cb) {
//   const query = 'SELECT * FROM orders WHERE customer = ?';
//   client.execute(query, [customer], {prepare: true}).then(res => {
//     findRelatedMerchandise(res, cb);
//   });
// };

// const findRelatedMerchandise = function findRelatedMerchandise(orders, cb) {
//   const resultRows = orders.rows;
//   const uniqueMerchandise = new Set();
//   resultRows.forEach(row => uniqueMerchandise.add(row.merchandiseid));
//   const query = 'SELECT * FROM orders WHERE merchandiseId IN ? ALLOW FILTERING';
//   client.execute(query, [Array.from(uniqueMerchandise)], {prepare: true}).then(res => {
//     console.log(res);
//     cb();
//   }).catch(err => {
//     console.log(err);
//   });
// };


// usersByBirthday(818125896, 818135996, () => client.shutdown());
// ordersByRange('jLHbGPug00', 0, 1545616608, () => client.shutdown());
// recEngine('jLHbGPug00', () => client.shutdown());
