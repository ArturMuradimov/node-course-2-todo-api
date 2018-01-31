//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    console.log('Unable to connect to MongoDB server');
    return;
  }
  console.log('Connected to MongoDB server');

  // db.collection('Todos').find({
  //   _id: new ObjectID('5a7198f6074fe10f4007c2fa')
  // }).toArray().then((docs) => {
  //   console.log('todos');
  //   console.log(JSON.stringify(docs, undefined, 2));
  // }, (err) => {
  //   console.log('unable to fetch todos', err);
  // });
  // db.collection('Todos').find().count().then((count) => {
  //   console.log(`todos count: ${count}`);
  // }, (err) => {
  //   console.log('unable to fetch todos', err);
  // });

  db.collection('Users').find({
    name: 'Artur'
  }).count().then((count) => {
    console.log('users count: ', count);
  }, (err) => {
    console.log('unable to fetch users count');
  });

  //db.close();
});
