require('./config/config');

const _ = require('lodash');

var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();

const port = process.env.PORT;

app.use(bodyParser.json());

// create todo
app.post('/todos', authenticate, async (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  try {
    var doc = await todo.save();
    res.send(doc);
  } catch (e) {
    res.status(400).send(e);
  }
});

// read all todos
app.get('/todos', authenticate, async (req, res) => {
  try {
    var todos = await Todo.find({
      _creator: req.user._id
    });
    res.send({todos});
  } catch (e) {
    res.status(400).send(e);
  }
});

// read todo by id
app.get('/todos/:id', authenticate, async (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    res.status(404).send();
    return;
  }

  try {
    var todo = await Todo.findOne({
      _id: id,
      _creator: req.user._id
    });
    if (!todo) {
      res.status(404).send();
      return;
    }
    res.send({todo});
  } catch (e) {
    res.status(400).send()
  }
});

// delete todo by id
app.delete('/todos/:id', authenticate, async (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    res.status(404).send();
    return;
  }

  try {
    var todo = await Todo.findOneAndRemove({
      _id: id,
      _creator: req.user._id
    });
    if (!todo) {
      res.status(404).send();
      return;
    }
    res.send({todo});
  } catch (e) {
    res.status(400).send()
  }
});

// update todos
app.patch('/todos/:id', authenticate, async (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    res.status(404).send();
    return;
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  try {
    var todo = await Todo.findOneAndUpdate({
      _id: id,
      _creator: req.user._id
    }, {
      $set: body
    }, {
      new: true
    });
    if (!todo) {
      return res.status(404).send();
    }
    res.send({todo});
  } catch (e) {
    res.status(400).send();
  }
});

// create user
app.post('/users', async (req, res) => {
  try {
    var body = _.pick(req.body, ['email', 'password', 'tokens']);
    var user = new User(body);
    await user.save();
    var token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// get current user
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

// login user
app.post('/users/login', async (req, res) => {
  try {
    var email = req.body.email;
    var password = req.body.password;
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send();
  }
  /*User.findOne({email}).then((user) => {
    if (!user) {
      return res.status(404).send();
    }

    var hashedPassword = user.password;
    console.log(password);
    console.log(hashedPassword);

    bcrypt.compare(password, hashedPassword, (err, compareRes) => {
      console.log(compareRes);
      if (!compareRes) {
        return res.status(400).send();
      }
      res.header('x-auth', user.tokens[0].token).send();;
    });
  }).catch((e) => {
    console.log(e);
    res.status(400).send();
  });*/
});

// logout user
app.delete('/users/me/token', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    res.status(200).send();
  } catch (e) {
    res.status(400).send();
  }
});

app.listen(port, () => {
  console.log('started on port ', port);
});

module.exports = {app};
