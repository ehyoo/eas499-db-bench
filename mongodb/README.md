To seed MongoDB, it is just a matter of running `seeder.js`.

To be comparable to the indices in Neo4j, we also make indices. Since the user's email and the 
merchandise's id are the `_id` fields in each document, we do not need to add indices since 
MongoDB automatically creates these indices for us.

Although each order `_id` has an index, we should make an index for each embedded field. So:
```
db.orders.createIndex({'_id.customer': 1})
db.orders.createIndex({'_id.timestamp': -1})
```
