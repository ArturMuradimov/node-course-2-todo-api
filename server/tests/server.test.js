const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe(' POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      })
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
    .post('/todos')
    .send({})
    .expect(400)
    .expect((res) => {
      expect(res.body.name).toBe("ValidationError")
    })
    .end((err, res) => {
      if (err) {
        done(err);
        return;
      }
      Todo.find().then((todos) => {
        expect(todos.length).toBe(2);
        done();
      }).catch((e) => done(e));
    })
  })
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  })
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(todos[0].text);
    })
    .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    var hexId = (new ObjectID()).toHexString();
    request(app)
    .get(`/todos/${hexId}`)
    .expect(404)
    .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get(`/todos/123`)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos:id', () => {
  it ('should remove a todo', (done) => {
    var hexId = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId)
      })
      .end((err, res) => {
        if (err) {
          return done (err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toBeFalsy();
          done();
        }).catch((e) => done(e));
      });
  });

  it ('should return 404 if todo not found', (done) => {
    var hexId = (new ObjectID()).toHexString();
    request(app)
    .delete(`/todos/${hexId}`)
    .expect(404)
    .end(done);
  });

  it ('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete(`/todos/123`)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos:id', () => {
  it('should update the todo', (done) => {
    var hexId = todos[0]._id.toHexString();
    var newText = 'First test todo updated';
    request(app)
      .patch(`/todos/${hexId}`)
      .send({text: newText, completed: true})
      .expect(200)
      .expect((res) => {
        expect(res.body.todo).toBeTruthy();
        expect(res.body.todo.text).toBe(newText);
        expect(res.body.todo.completed).toBe(true);
        expect(typeof res.body.todo.completedAt).toBe('number');
      })
      .end((err, res) => {
        if (err) {
          return done (err);
        }
        Todo.findById(hexId).then((todo) => {
          expect(todo).toBeTruthy();
          expect(todo.text).toBe(newText);
          expect(todo.completed).toBe(true);
          expect(typeof todo.completedAt).toBe('number');
          done();
        }).catch((e) => done(e));
      });
  });

  it('should clear completedAt when todo is not completed', (done) => {
    var hexId = todos[1]._id.toHexString();
    var newText = 'Second test todo updated';
    request(app)
      .patch(`/todos/${hexId}`)
      .send({text: newText, completed: false})
      .expect(200)
      .expect((res) => {
        expect(res.body.todo).toBeTruthy();
        expect(res.body.todo.text).toBe(newText);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done (err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toBeTruthy();
          expect(todo.text).toBe(newText);
          expect(todo.completed).toBe(false);
          expect(todo.completedAt).toBeFalsy();
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });
  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'user3@mail.com';
    var password = 'user3pass';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email)
      })
      .end((err) => {
        if (err) {
          return done(err);
        }
        User.findOne({email}).then((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
          done();
        });
      });
  });

  it('should return validation error if request is invalid', (done) => {
    var email = 'user3@mail.com';
    var password = 'user3';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end((err) => {
        if (err) {
          return done(err);
        }
        User.findOne({email}).then((user) => {
          expect(user).toBeFalsy();
          done();
        });
      });
  });

  it('should not create user if email in use', (done) => {
    var email = users[0].email;
    var password = 'user3Pass';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end((err) => {
        if (err) {
          return done(err);
        }
        User.find({email}).then((users) => {
          expect(users.length).toBe(1);
          done();
        });
      });
  });
});
