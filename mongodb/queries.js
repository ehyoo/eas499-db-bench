const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const fs = require('fs');

// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'eas499';
// Create a new MongoClient
const client = new MongoClient(url);

// find users with birthdays between...
const usersByBirthday = function findUsersWithBirthdaysInRange(
  db, lowerBound, upperBound, callback) {
  
  const usersCollection = db.collection('users');
  const query = {birthday: {$gt: lowerBound, $lt: upperBound}}
  usersCollection.find(query).toArray((err, res) => {
    if (!err) {
      console.log(res);
    } else {
      console.log('There was an error:')
      console.log(err);
    }
    callback();
  });
};

// find orders between ... and ...
// TODO: edit this query so we're looking for some specific user.
const ordersByRange = function findOrdersWithTimestampInRange(
  db, customer, lowerBound, upperBound, callback) {
  
  const ordersCollection = db.collection('orders');
  const query = {'_id.customer': customer, '_id.timestamp': {$gt: lowerBound, $lt: upperBound}};
  ordersCollection.find(query).toArray((err, res) => {
    if (!err) {
      console.log(res);
    } else {
      console.log('there was an error:')
      console.log(err);
    }
    callback();
  }); 
};

// rec engine: for a user, query what other items they have given what they bought.
const recEngine = function getRecommendedMerchandiseForUser(db, userId) {
  findUniqueUserMerch(db, userId, (merchArr) => {
    findRelatedMerchandise(db, merchArr, (recommendedMerch) => {
      console.log(recommendedMerch);
      console.log(recommendedMerch.length)
      console.log(merchArr.length)
      client.close();
    });
  });
}

const findUniqueUserMerch = function findAllUniqueMerchandiseUserOrdered(db, userId, cb) {
  const ordersCollection = db.collection('orders');
  ordersCollection.distinct('merchandiseOrdered', {'_id.customer': userId}, (err, res) => {
    cb(res);
  });
}

const findRelatedMerchandise = function findRelatedMerchandise(db, merchArr, cb) {
  const ordersCollection = db.collection('orders');
  const merchCollection = db.collection('merch');
  ordersCollection.distinct('merchandiseOrdered.id',
    {merchandiseOrdered: {'$in': merchArr}},
    (err, relatedMerch) => {
      // Then we make one more hop since we want the most recent. 
      merchCollection.find({_id: {'$in': relatedMerch}}).toArray((err, recommendedMerch) => {
        cb(recommendedMerch);
      });
    }
   );
}

// Use connect method to connect to the Server
client.connect(function(err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    // usersByBirthday(db, 853306370, 853356370, () => client.close());
    // ordersByRange(db, 'jLHbGPug00', 1535060020, 1555060320, () => client.close());
    recEngine(db, "jLHbGPug00");
  }
);

// Note there is a slight discrepancy between this and Neo4j- this returns all the orders (including)
// the ones originally ordered
// While Neo4j returns the orders that don't include the ones originally ordered
