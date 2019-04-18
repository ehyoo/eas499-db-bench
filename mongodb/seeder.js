// utilizing starting code from
// http://mongodb.github.io/node-mongodb-native/3.2/quick-start/quick-start/
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const fs = require('fs');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'eas499';

// Create a new MongoClient
const client = new MongoClient(url);

const insertUsers = function insertUsers(db, callback) {
  const rawUsers = JSON.parse(fs.readFileSync('../data_generator/data/users.json', 'utf8'));
  const users = rawUsers.map((user) => {
    return {
      _id: user.email, // use user's email as the unique id
      firstName: user.firstName,
      lastName: user.lastName,  
      birthday: user.birthday,
      listedMerch: user.listedMerch
    };
  });
  const usersCollection = db.collection('users');
  usersCollection.insertMany(users, (err, result) => {
    console.log('usersCollection done');
    callback();
  });
};

const insertMerch = function insertMerch(db, callback) {
  const rawMerch = JSON.parse(fs.readFileSync('../data_generator/data/merchandise.json', 'utf8'));
  const merch = rawMerch.map((merchObj) => {
    return {
      _id: merchObj.id,
      price: merchObj.price
    };
  });
  const merchCollection = db.collection('merch');
  merchCollection.insertMany(merch, (err, result) => {
    console.log('merchCollection done');
    callback();
  });
};

const insertOrders = function insertOrders(db, callback) {
  const rawOrders = JSON.parse(fs.readFileSync('../data_generator/data/orders.json', 'utf8'));
  const orders = rawOrders.map((order) => {
    return {
      _id: {
        customer: order.customer,
        timestamp: order.timestamp,
      },
      merchandiseOrdered: order.merchandiseOrdered
    };
  });
  const ordersCollection = db.collection('orders');

  ordersCollection.insertMany(orders, (err, result) => {
    console.log('orderCollection done');
    callback();
  });
};

// Load in our users 
const insertData = function insertData(db, callback) {
  let numberTasksDone = 0
  const closeWhenAllFinished = function closeWhenAllFinished() {
    numberTasksDone = numberTasksDone + 1;
    if (numberTasksDone === 3) {
      callback();
    }
  }
  insertUsers(db, closeWhenAllFinished);
  insertMerch(db, closeWhenAllFinished);
  insertOrders(db, closeWhenAllFinished);
}

// Use connect method to connect to the Server
client.connect(function(err) {
  assert.equal(null, err);
  const db = client.db(dbName);
  insertData(db, () => client.close());
});
