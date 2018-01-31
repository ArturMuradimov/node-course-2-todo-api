//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

// var obj = new ObjectID();
// console.log(obj);

// var user = {name: 'Artur', age: 33};
// var {name} = user;
// console.log(name);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    console.log('Unable to connect to MongoDB server');
    return;
  }
  console.log('Connected to MongoDB server');

  // db.collection('Todos').insertOne({
  //   text: 'something to do',
  //   completed: false
  // }, (err, result) => {
  //   if (err) {
  //     console.log('unable to insert todo', err);
  //     return;
  //   }
  //   console.log(JSON.stringify(result.ops, undefined, 2));
  // });

  // db.collection('Users').insertOne({
  //   name: 'Artur',
  //   age: 33,
  //   location: 'Ufa'
  // }, (err, result) => {
  //   if (err) {
  //     console.log('unable to insert user', err);
  //     return;
  //   }
  //   console.log(JSON.stringify(result.ops, undefined, 2));
  //   console.log(result.ops[0]._id.getTimestamp());
  // });

  db.close();
});
