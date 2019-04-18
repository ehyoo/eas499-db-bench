// starter code from https://github.com/datastax/nodejs-driver]
// and https://academy.datastax.com/units/getting-started-apache-cassandra-and-nodejs?resource=getting-started-apache-cassandra-and-nodejs
const cassandra = require('cassandra-driver');
const async = require('async');
const fs = require('fs');

const client = new cassandra.Client({
  localDataCenter: 'datacenter1',
  contactPoints: ['127.0.0.1'],
  keyspace: 'eas499'
});