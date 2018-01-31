const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// var id = '5a71f199a361972a3c61b7b11';
//
// if (!ObjectID.isValid(id)) {
//   console.log('id not valid');
// }

// Todo.find({
//   _id: id
// }).then((todos) => {
//   console.log('todos: ', todos);
// });
//
// Todo.findOne({
//   _id: id
// }).then((todo) => {
//   console.log('todo: ', todo);
// });

// Todo.findById(id).then((todo) => {
//   if (!todo) {
//     return console.log('id not found');
//   }
//   console.log('todo by id: ', todo);
// }).catch((e) => console.log(e));

var id = '5a71da2d64791316388e24fb';

User.findById(id).then((user) => {
  if (!user) {
    return console.log('id not found');
  }
  console.log('user by id: ', user);
}).catch((e) => console.log(e));
