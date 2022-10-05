const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const  { username } = request.headers;
  const accountExists = users.some(user => user.username === username);

  if(!accountExists || !username){
    return response.status(400).error("");
  }

  next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const id = uuidv4();

  if(!name || !username){
    return response.status(400).json({ error: 'Usuário ou nome inválidos' });
  }

  const userExists = users.some(user => user.username == username);
  if(userExists){
    return response.status(400).json({ error: 'Nome de usuáro já usado' });
  }

  const user = ({
    id,
    name,
    username,
    todos: []
  })

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const todoList = users.find(user => user.username == username).todos;

  if(!todoList){
    return response.status(400).json({ message: 'Todo list inexistente'})
  }

  return response.json(todoList);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const id = uuidv4();

  const todoList = users.find(user => user.username == username).todos;
  const newTodoItem = {
    id,
    deadline,
    done: false,
    title,
    created_at: new Date(),
  }

  todoList.push(newTodoItem)

  return response.status(201).json(newTodoItem);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const { id } = request.params;
  console.log({id})

  const todoItem = (users.find(user => user.username == username).todos).find(todo => todo.id == id);

  if(!todoItem){
    return response.status(404).json({ error: 'Todo item inexistente'})
  }

  Object.assign(todoItem, {
    title,
    deadline
  })


  return response.status(200).json({
    title,
    deadline,
    done: todoItem.done,
  });
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const todoItem = (users.find(user => user.username == username).todos).find(todo => todo.id == id);

  if(!todoItem){
    return response.status(404).json({ error: 'Todo item inexistente'})
  }

  todoItem.done = true;
  
  return response.status(200).json(todoItem);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const todoItemPosition = (users.find(user => user.username == username).todos)
  .findIndex(todo => todo.id == id);

  if(todoItemPosition < 0){
    return response.status(404).json({ error: 'Todo item inexistente'})
  }

  const modifiedUsers = (users.find(user => user.username == username))
  .todos.splice(todoItemPosition-1, 1)

  return response.status(204).send();
});

module.exports = app;