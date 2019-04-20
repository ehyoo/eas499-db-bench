Cassandra, unlike MongoDB, doesn't create keyspaces and tables automatically.
So, we have to run the following commands:
```
CREATE KEYSPACE IF NOT EXISTS eas499 WITH REPLICATION={'class': 'SimpleStrategy', 'replicationFactor': 1};
```
Then, we create our tables.

```
USE eas499;

CREATE TABLE users(
  id text PRIMARY KEY,
  firstName text,
  lastName text,
  birthday bigint,
  listedMerch set<text>
);

CREATE TABLE merch (
  id text PRIMARY KEY,
  price double
);

CREATE TABLE orders (
  customer text,
  timestamp bigint,
  merchandiseId text,
  PRIMARY KEY (customer, timestamp, merchandiseId)
) WITH CLUSTERING ORDER BY (timestamp DESC, merchandiseId DESC);
```

### Seeding the Database
Cassandra doesn't allow bulk loads in the same way that MongoDB does- utilize CQL's COPY method to do this for us:

Before inserting users, rename "email" to "id"- oversight on my part for this.
```
COPY eas499.users (birthday, id, firstname, lastname, listedmerch) FROM '/my/path/to/users.csv' WITH HEADER=TRUE;
COPY eas499.orders (customer, merchandiseId, timestamp) FROM '/my/path/to/orders_flattened.csv' WITH HEADER=TRUE;
COPY eas499.merch (id, price) FROM '/my/path/to/merchandise.csv' WITH HEADER=TRUE;
```

Finally, create a secondary index on merchandiseId
```
create index merchIdIndex on orders (merchandiseId);
```
<!-- 
For me:
COPY eas499.users (birthday, id, firstname, lastname, listedmerch) FROM '/mnt/c/Users/ehyoo/Documents/dev/eas499-db-bench/data_generator/data/users.csv' WITH HEADER=
TRUE;
COPY eas499.orders (customer, merchandiseId, timestamp) FROM '/mnt/c/Users/ehyoo/Documents/dev/eas499-db-bench/data_generator/data/orders_flattened.csv' WITH HEADER=TRUE;
COPY eas499.merch (id, price) FROM '/mnt/c/Users/ehyoo/Documents/dev/eas499-db-bench/data_generator/data/merchandise.csv' WITH HEADER=TRUE;
-->

We can finally run our tests.
