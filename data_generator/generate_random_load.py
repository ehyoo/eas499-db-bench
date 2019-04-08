'''
This is where our data is going to reside.

We create a test load that resembles something like the following:

User: {
    userId: Some UUID,
    name: {
        first_name: String,
        last_name: String
    },
    birthday: Date,
    friends: [see below],
    pets: [{
        type: 'str',
        name: 'some name'
    }]
}

Within MongoDB: we insert these documents as-is, with friends being a list of IDs
Within Neo4j, we'll model this utilizing two nodes: the User type and the Pet type.
Within Cassandra, we'll model this using userId as our simple primary key, secondary index on Date.
    TODO: This is for you- figure out if you can index into user-types for collections and run efficient
        queres on them (how many users have pets of type cat?)
'''




