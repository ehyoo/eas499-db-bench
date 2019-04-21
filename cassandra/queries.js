const usersByBirthday = function findUsersWithBirthdaysInRange(client, lowerBound, upperBound, cb) {
  // Note that, to execute this, we have to utilize "ALLOW FILTERING"
  // Why? https://www.datastax.com/dev/blog/allow-filtering-explained-2
  // Cassandra in the backend retrieves all the rows, then filters out the ones that aren't desired. So, 
  // obviously, this does not leverage Cassandra's strengths, though it does allow us to execute our queries. 
  const query = 'SELECT * FROM users WHERE birthday < ? AND birthday > ? ALLOW FILTERING';
  client.execute(query, [upperBound, lowerBound], {prepare: true}).then(res => {
    // console.log(res);
    cb();
  }).catch(err => {
    console.log(err);
    cb();
  });
};

const ordersByRange = function findOrdersWithTimestampInRange(client, customer, lowerBound, upperBound, cb) {
  const query = 'SELECT * FROM orders WHERE customer = ? AND timestamp < ? AND timestamp > ?';
  client.execute(query, [customer, upperBound, lowerBound], {prepare: true}).then(res => {
    // console.log(res);
    cb();
  }).catch(err => {
    console.log(err);
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


/**
 * We have to do a pseudo-join here, which is why we have to pipeline two queries together.
 */
const aggregateSpend = function getAggregateSpendingAmountForUser(client, customer, callback) {
  const query1 = 'SELECT merchandiseid FROM orders WHERE customer = ?';
  client.execute(query1, [customer], {prepare: true}).then(res => {
    sumResults(client, customer, res.rows.map(r => r.merchandiseid), callback);
  }).catch(err => {
    // console.log(err);
    callback();
  });
}

const sumResults = function sumAllMerchandiseOrderedForUser(client, customer, merchandiseBoughtList, callback) {
  const query2 = 'SELECT * FROM merch WHERE id IN ?';
  if (merchandiseBoughtList.length < 1) {
    console.log('no id');
    return callback();
  }
  client.execute(query2, [merchandiseBoughtList], {prepare: true}).then(res => {
    const idPriceObject = {};
    res.rows.forEach(row => {
      idPriceObject[row.id] = row.price;
    });
    let aggregateCost = 0;
    merchandiseBoughtList.forEach(merch => {
      aggregateCost += idPriceObject[merch];
    });
    // there are floating point issues, but that's not important for us.
    // console.log({customer, aggregateCost}); 
    callback();
  }).catch(err => {
    console.log(err);
    callback();
  });
}

/**
 * Theoretically, we would want to do something like:
 * SELECT count(customer, timestamp) AS num_times_ordered FROM orders WHERE timestamp > lowerBound
 * AND timestamp < upperBound GROUP BY merchandiseId ALLOW FILTERING;
 * 
 * That being said, when trying to execute something similar to the above, Cassandra throws at us
 * the message "Group by currently only support columns following their declared order in the 
 * primary key". Meaning, the above query is impossible to do with the current Cassandra version.
 * 
 * Once again, we do more work on the client side to get our desired results
 */
const popularity = function getTopThreeMostOrderedItemsForTimeRange(client, lowerBound, upperBound, callback) {
  // The general strategy: find the rows within the timestamp
  const query = 'SELECT * FROM orders WHERE timestamp > ? AND timestamp < ? ALLOW FILTERING';
  const countObj = {};
  // We call .eachRow in case we get lots of data- Cassandra only loads 5000 rows (by default) into the 
  // client.
  client.eachRow(query, [lowerBound, upperBound], {prepare: true, autoPage: true}, (n, row) => {
    // Then aggregate on the client side for the number of orders per merchandise
    if (!(row.merchandiseid in countObj)) {
      countObj[row.merchandiseid] = {merchandiseId: row.merchandiseid, count: 0};
    }
    countObj[row.merchandiseid].count++;
  }, () => {
    // Finally, find the top three merchandises with the most orders
    let minRow = null;
    let rankArr = [];
    Object.values(countObj).forEach(row => {
      if (minRow == null) {
        minRow = row;
      }
      if (rankArr.length < 3) {
        rankArr.push(row);
        if (row.count < minRow.count) {
          minRow = row;
        };
      } else {
        if (minRow.count < row.count) {
          const whereMin = rankArr.findIndex(e => e.count === minRow.count);
          rankArr[whereMin] = row;
          minRow = null;
          rankArr.forEach(e => {
            if (minRow === null) {
              minRow = e;
            } else {
              if (e.count < minRow.count) {
                minRow = e;
              }
            };
          });
        }
      };
    });
    // console.log(rankArr);
    callback();
  });
}

const writeOrder = function writeOrder(client, customer, timestamp, merchandiseOrdered, callback) {
  const query = 'INSERT INTO orders (customer, timestamp, merchandiseid) VALUES (?, ?, ?)';
  const queryList = merchandiseOrdered.map(m => {
    return {query, params: [customer, timestamp, m.id]} 
  });
  client.batch(queryList, {prepare: true}).then(() =>{
    callback();
  }).catch(err => {
    console.log(err);
    callback();
  });
}

// select merchandiseId, count(merchandiseId) AS num_times_ordered from orders where 
// timestamp > 1535060020 and timestamp < 1555060320 GROUP BY customer, timestamp allow filtering;

module.exports = {
  usersByBirthday,
  ordersByRange,
  aggregateSpend,
  popularity,
  writeOrder
};
