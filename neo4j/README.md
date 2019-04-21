Much of this procedure was derived from https://neo4j.com/developer/guide-importing-data-and-etl
We'll have two nodes: Users, Merchandise, and Orders.
We'll also have a "purchased" relationship between users and orders and a "contains" relationship between orders and merchandise.

After copying the files into the import directory for neo4j:
```
LOAD CSV WITH HEADERS FROM "file:/users.csv" as row
CREATE (:User{email: row.email, birthday: row.birthday, firstName: row.firstName, lastName: row.lastName});

LOAD CSV WITH HEADERS FROM "file:/merchandise.csv" as row
CREATE (:Merchandise{merchId: row.id, price: row.price});

LOAD CSV WITH HEADERS FROM "file:/orders.csv" as row
CREATE (:Order{timestamp: row.timestamp, customer: row.customer});
```
We add additional data (since we don't really need the "customer" thing), but we do it anyway to be consistent with the data models we have with Cassandra and MongoDB

We'll also create some indexes on these fields to speed things up:
```
CREATE INDEX ON :Order(customer);
CREATE INDEX ON :Order(timestamp);
CREATE INDEX ON :User(email);
CREATE INDEX ON :Merchandise(merchId);
```

Then loading in our relationships:
```
LOAD CSV WITH HEADERS FROM "file:/orders.csv" AS row
MATCH (order:Order {customer: row.customer, timestamp: row.timestamp})
MATCH (user:User {email: row.customer})
CREATE (user)-[:PURCHASED]->(order);

LOAD CSV WITH HEADERS FROM "file:/orders_flattened_1.csv" AS row
MATCH (order:Order {customer: row.customer, timestamp: row.timestamp})
MATCH (merch:Merchandise {merchId: row.merchandiseId})
CREATE (order)-[:CONTAINS]->(merch);

LOAD CSV WITH HEADERS FROM "file:/orders_flattened_2.csv" AS row
MATCH (order:Order {customer: row.customer, timestamp: row.timestamp})
MATCH (merch:Merchandise {merchId: row.merchandiseId})
CREATE (order)-[:CONTAINS]->(merch);

LOAD CSV WITH HEADERS FROM "file:/orders_flattened_3.csv" AS row
MATCH (order:Order {customer: row.customer, timestamp: row.timestamp})
MATCH (merch:Merchandise {merchId: row.merchandiseId})
CREATE (order)-[:CONTAINS]->(merch);

LOAD CSV WITH HEADERS FROM "file:/orders_flattened_4.csv" AS row
MATCH (order:Order {customer: row.customer, timestamp: row.timestamp})
MATCH (merch:Merchandise {merchId: row.merchandiseId})
CREATE (order)-[:CONTAINS]->(merch);

LOAD CSV WITH HEADERS FROM "file:/orders_flattened_5.csv" AS row
MATCH (order:Order {customer: row.customer, timestamp: row.timestamp})
MATCH (merch:Merchandise {merchId: row.merchandiseId})
CREATE (order)-[:CONTAINS]->(merch);

LOAD CSV WITH HEADERS FROM "file:/orders_flattened_6.csv" AS row
MATCH (order:Order {customer: row.customer, timestamp: row.timestamp})
MATCH (merch:Merchandise {merchId: row.merchandiseId})
CREATE (order)-[:CONTAINS]->(merch);
```
Where we break apart the "orders_flattened" data since we encountered memory issues when trying to load it in all at once.
Finally, we are finished, with ~800,000 nodes, and ~2 million edges.
