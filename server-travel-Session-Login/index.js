const express = require("express");
const index = express();
const session = require("express-session");
const bcrypt = require("bcryptjs");
// const tripsRouter = require("./routes/trips");
//uuid
const { v4: uuidv4 } = require("uuid");

// path is already part of the NodeJS framework
// you don't have to install it
const path = require("path");

const VIEWS_PATH = path.join(__dirname, "/views");
console.log(VIEWS_PATH);

//middleware
index.use(express.urlencoded());
// index.use("/trips", tripsRouter);
const mustacheExpress = require("mustache-express");
const { nextTick } = require("process");

index.use(
  session({
    secret: "foreverandfivedays",
    resave: false,
    saveUninitialized: true,
  })
);

// setting up Express to use Mustache Express as template pages
index.engine(
  "mustache",
  mustacheExpress(VIEWS_PATH + "/partials", ".mustache")
);
// the pages are located in views directory
index.set("views", VIEWS_PATH);
// extension will be .mustache
index.set("view engine", "mustache");

//empty user array to store users
let users = [
  { userId: uuidv4(), username: "cristinahdz29", password: "december29" },
  { userId: uuidv4(), username: "a", password: "a" },
];

let trips = [];

//register page action
index.get("/register", (req, res) => {
  console.log(users);
  res.render("register");
});

//get information from register page
index.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const existingUser = users.find((user) => {
    return user.username == username && user.password == password;
  });

  if (existingUser) {
    if (req.session) {
      // req.isRegistered = true
      req.session.username = username;
      res.render("register", { message: "Account already exists" });
    }
  } else {
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, function (err, hash) {
        if (err) {
          res.redirect("/register", { message: "Error has occurred!" });
        } else {
          let user = {
            username: username,
            password: hash,
          };
          console.log(user);
          users.push(user);
          res.redirect("/login");
        }
      });
    });
  }
});

//creating login route
index.get("/login", (req, res) => {
  res.render("login");
});

//login POST route, where users can login in with a username & password
index.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // check if the username and password matches of a user in the users array
  // using 'find' array helper to look through list of users and see if others match
  const persistedUser = users.find((user) => {
    return user.username == username;
  });

  if (!persistedUser) {
    res.render("login", { message: "Username or password is incorrect" });
    return;
  }

  bcrypt.compare(password, persistedUser.password, function (err, result) {
    console.log(result);

    if (result) {
      //password matches
      res.redirect("/profile");
    } else {
      res.render("login", { message: "Password is incorrect" });
    }
  });
  //   if (persistedUser) {
  //     // put something in the session to indicate that the user is
  //     // logged in
  //     if (req.session) {
  //       // don't put sensitive data into the session
  //       //   req.session.isAuthenticated = true;
  //       req.session.userId = persistedUser.userId;
  //       //req.session.foo = username
  //       res.redirect("/profile");
  //     }
  //   } else {
  //     // tell the user that username or password is incorrect
  //     res.render("login", { message: "Username or password is incorrect" });
  //   }
});

//profile page route, will be /profile
index.get("/profile", (req, res) => {
  const userId = req.session.userId;
  userTrips = trips.filter((trip) => {
    return trip.userId == userId;
  });
  console.log(userTrips);
  res.render("profile", { trips: userTrips });
});

//create new route to POST trips to trips array
index.post("/profile", (req, res) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const dateDeparture = req.body.dateDeparture;
  const dateReturn = req.body.dateReturn;

  let trip = {
    userId: req.session.userId,
    tripId: uuidv4(),
    title: title,
    imageUrl: imageUrl,
    dateDeparture: dateDeparture,
    dateReturn: dateReturn,
  };

  trips.push(trip);

  res.redirect("/profile");
});

// index.get("/profile-trips", (req, res) => {
//   const userId = req.session.userId;
//   console.log(userId);
//   userTrips = trips.filter((trip) => {
//     return trip.userId == userId;
//   });
//   res.render("profile", { trips: userTrips });
// });

//delete trips route
//deleting trips
index.post("/profile-delete", (req, res) => {
  const tripId = req.body.tripId;
  trips = trips.filter((trip) => {
    return trip.tripId != tripId;
  });
  res.redirect("/profile");
});

index.get("/logout", (req, res) => {
  req.session.destroy(function (err) {
    res.redirect("/login");
  });
});

//initializing the server
index.listen(3000, () => {
  console.log("Server is running....");
});
