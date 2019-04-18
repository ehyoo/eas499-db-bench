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
const ordersByRange = function findOrdersWithTimestampInRange(
  db, lowerBound, upperBound, callback) {
  
  const ordersCollection = db.collection('orders');
  const query = {'_id.timestamp': {$gt: lowerBound, $lt: upperBound}};
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
  const usersCollection = db.collection('users');
  usersCollection.findOne({_id: userId}, (err, res) => {
    const user = res;
    findUniqueUserMerch(db, user, (merchSet) => {
      findRelatedMerchandise(db, merchSet, (recommendedMerch) => {
        console.log(recommendedMerch);
        client.close();
      });
    });
  });
}

const findUniqueUserMerch = function findAllUniqueMerchandiseUserOrdered(db, userObject, cb) {
  const ordersCollection = db.collection('orders');
  ordersCollection.find({'_id.customer': userObject._id}).toArray((err, res) => {
    const merchandiseOrdered = new Set();
    res.forEach((order) => {
      order.merchandiseOrdered.forEach(merch => merchandiseOrdered.add(merch));
    });
    cb(merchandiseOrdered);
  });
}

const findRelatedMerchandise = function findRelatedMerchandise(db, merchandiseSet, cb) {
  const merchArr = Array.from(merchandiseSet);
  const ordersCollection = db.collection('orders');
  const merchCollection = db.collection('merch');

  ordersCollection.find({merchandiseOrdered: {'$in': merchArr}}).toArray((err, relatedOrders) => {
    const relatedMerchandiseId = new Set();
    relatedOrders.forEach((order) => {
      order.merchandiseOrdered.forEach(merch => relatedMerchandiseId.add(merch.id));
    });
    merchCollection.find({_id: {'$in': Array.from(relatedMerchandiseId)}}).toArray((err, recommendedMerch) => {
      cb(recommendedMerch);
    });
  });
}

// Use connect method to connect to the Server
client.connect(function(err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    // usersByBirthday(db, 853306370, 853356370, () => client.close());
    // ordersByRange(db, 1506638727, 1506639927, () => client.close());
    // recEngine(db, "0bZB535ya5");
  }
);

