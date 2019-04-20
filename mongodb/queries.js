// find users with birthdays between...
const usersByBirthday = function findUsersWithBirthdaysInRange(
  db, lowerBound, upperBound, callback) {
  
  const usersCollection = db.collection('users');
  const query = {birthday: {$gt: lowerBound, $lt: upperBound}}
  usersCollection.find(query).toArray((err, res) => {
    if (!err) {
      // console.log(res); // for correctness- the actual output doesn't really matter.
      callback();
    } else {
      console.log('There was an error:')
      console.log(err);
      callback();
    }
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
      // console.log(res);
      callback();
    } else {
      console.log('there was an error:')
      console.log(err);
      callback();
    }
  }); 
};


// Note there is a slight discrepancy between this and Neo4j- this returns all the orders (including)
// the ones originally ordered
// While Neo4j returns the orders that don't include the ones originally ordered
const recEngine = function getRecommendedMerchandiseForUser(db, userId, cb) {
  findUniqueUserMerch(db, userId, (merchArr) => {
    findRelatedMerchandise(db, merchArr, (recommendedMerch) => {
      // console.log(recommendedMerch);
      cb();
    });
  });
};

const findUniqueUserMerch = function findAllUniqueMerchandiseUserOrdered(db, userId, cb) {
  const ordersCollection = db.collection('orders');
  ordersCollection.distinct('merchandiseOrdered', {'_id.customer': userId}, (err, res) => {
    cb(res);
  });
};

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
};

const aggregateSpend = function getAggregateSpendingAmountForUser(db, customer, cb) {
  const ordersCollection = db.collection('orders');
  ordersCollection.aggregate([
    {$match: {'_id.customer': customer}},
    {$unwind: '$merchandiseOrdered'},
    {$group: {'_id': customer, 'aggSpend': {$sum: '$merchandiseOrdered.price'}}}
  ]).toArray((err, res) => {
    if (!err) {
      // console.log(res);
      cb();
    } else {
      console.log(err);
      cb();
    }
  });
};

const popularity = function getTopThreeMostOrderedItemsForTimeRange(db, lowerBound, upperBound, cb) {
  const ordersCollection = db.collection('orders');
  ordersCollection.aggregate([
    {$match: {'_id.timestamp': {'$gt': lowerBound, '$lt': upperBound}}},
    {$unwind: '$merchandiseOrdered'},
    {$group: {_id: '$merchandiseOrdered.id', count: {$sum: 1}}},
    {$sort: {count: -1}},
    {$limit: 3}
  ]).toArray((err, res) => {
    if (!err) {
      // console.log(res);
      cb();
    } else {
      console.log(err);
      cb();
    }
  });
};

module.exports = {
  usersByBirthday,
  ordersByRange,
  recEngine,
  aggregateSpend,
  popularity
};
