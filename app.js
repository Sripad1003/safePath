var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var passport = require("passport");
var methodOverride = require("method-override");
var path = require('path');

const fs = require("fs");

app.get("/maps-loader.js", (req, res) => {
  const apiKey = fs.readFileSync("api.txt", "utf8").trim();

  res.type("application/javascript");
  res.send(`
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&libraries=places&callback=initMap";
    // script.async = true;
    document.head.appendChild(script);
  `);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

app.get("/", function (req, res) {
  res.render("index");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/signup", function (req, res) {
  res.render("signup");
});
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

app.post("/signup", function (req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("Username and password required");
  }

  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  }

  if (users.find(u => u.username === username)) {
    return res.status(400).send("User already exists");
  }

  users.push({ username, password }); // In a real app, hash the password!
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

  res.redirect("/login");
});

app.post("/login", function (req, res) {
  const { username, password } = req.body;

  if (!fs.existsSync(USERS_FILE)) {
    return res.status(400).send("User not found");
  }

  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    res.redirect("/maps");
  } else {
    res.status(401).send("Invalid credentials");
  }
});
app.get("/maps", function (req, res) {
  res.render("maps");
});

app.listen(3000, function () {
  console.log("Safe Path Recommender Ready to use in Browser ~(^_^)~");
  console.log("Server started on port 3000");

});
