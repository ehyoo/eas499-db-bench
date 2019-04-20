# EAS499 - Senior Capstone Thesis
### Hohun Yoo

Supplementary material to run performance tests on three NoSQL databases: MongoDB, Neo4j, and Cassandra.

## Premise
Despite NoSQL databases taking a significant role in modern data management, it is unclear what they
are truly capable of and under what conditions they excel or fall behind.  
We present some tests that seek to simulate some queries that might occur.

## The Data Model
To test this, we create a simple e-commerce data model. We have three main models: the user, the 
order, and the merchandise.

The user:
```
{
    email: str <unique key>
    firstName: str
    lastName: str
    birthday: long that represents date between 1/1/1990-12/31/2000
    listedMerch: [id of merch]
}
```
The order:
```
{
    customer: str <compound unique key>
    timestamp: date between 1/1/2016-5/1/2019 <compound unique key>
    merchandiseOrdered: [{merchandise object}]
}
```
The merchandise:
```
{
    id: str
    price: float
}
```
All fields are generated randomly, and the implementation details can be found in 
`data_generator/generate_random_load.py`. As it stands, there are 100,000 unique users, ~220,000 unique merchandise, and ~501,000 unique orders.

## The Tests
We provide five separate queries:
 * `findUsersWithBirthdaysInRange`: Find all the users in our database with birthdays between two dates.
 * `findOrdersWithTimestampInRange`: Find all the orders that a specific user made between two dates.
 * `getRecommendedMerchandiseForUser`: A simple recommendation engine: given a specific users, 
 find all the merchandise that they ordered and find all the merchandise that other users have ordered who ordered the same thing.
 * `getAggregateSpendingAmountForUser`: Given a user, find how much they have spent.
 * `getTopThreeMostOrderedItemsForTimeRange`: Given two dates, find the three most ordered items.

## Setup and Execution
Run `generate_random_load.py`, and follow the READMEs in each database directory to setup and seed the 
databases with the data.


