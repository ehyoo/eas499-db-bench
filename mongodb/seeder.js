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

// Load in our users 
const insertData = function insertData(db, callback) {
  const users = JSON.parse(fs.readFileSync('../data_generator/data/users.json', 'utf8'));
  const merch = JSON.parse(fs.readFileSync('../data_generator/data/merchandise.json', 'utf8'));
  const orders = JSON.parse(fs.readFileSync('../data_generator/data/orders.json', 'utf8'));

  const usersCollection = db.collection('users');
  const merchCollection = db.collection('merch');
  const ordersCollection = db.collection('orders');

  let usersDidFinish = false;
  let merchDidFinish = false;
  let ordersDidFinish = false;

  const executeCallback = function executeCallback() {
  	if (usersDidFinish && merchDidFinish && ordersDidFinish) {
  		callback();
  	}
  }

  // Insert some documents
  usersCollection.insertMany(users, (err, result) => {
  	console.log('Inserted our users!');
  	usersDidFinish = true;
    callback(result);
  });

  merchCollection.insertMany(merch, (err, result) => {
  	console.log('Inserted our merchandise!');
  	merchDidFinish = true;
    callback(result);
  });

  ordersCollection.insertMany(orders, (err, result) => {
  	console.log('Inserted our orders!');
  	ordersDidFinish = true;
    callback(result);
  });
}

// Use connect method to connect to the Server
client.connect(function(err) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);
  insertData(db, () => client.close());
});





