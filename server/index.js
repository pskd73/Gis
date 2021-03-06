const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const observer = require("./observer");
const Db = require("./db");

const app = express();
const http = require("http").Server(app);

app.use(bodyParser.json());

const allClients = [];

const storage = {}

app.use(express.static("./client/dist"));

const postRoutes = ["branches", "currentBranch", "diff", "commits", "config"];

postRoutes.forEach(route => {
  app.post(`/${route}`, (req, res) => {
    storage[route] = req.body[route];
    allClients.forEach(c => c.emit(route, storage[route]));
    res.send("success");
  });
});

const server = app.listen(8493, () => console.log("Listening on 8493.."));

const io = require("socket.io")(server);
io.on("connection", socket => {
  allClients.push(socket);

  socket.emit("init", {
    branches: storage.branches,
    currentBranch: storage.currentBranch,
    diff: storage.diff,
    commits: storage.commits,
    todos: Db.getAllTodos(),
    config: storage.config
  });

  socket.on("post/todos", todos => {
    todos.map(todo => Db.saveTodo(todo));
    socket.emit("todos", Db.getAllTodos());
  });

  socket.on("delete/todo", id => {
    Db.removeTodoById(id);
    socket.emit("todos", Db.getAllTodos());
  });
});

observer.watch();