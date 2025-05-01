const { faker, tr } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "",    //your database name 
  password: "",   // mysql password
});

// Faker --> fake data
let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};
// console.log(getRandomUser());

//============ Routing (Express Home Route =================//
app.get("/", (req, res) => {
  let q = "SELECT count(*) FROM user";
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["count(*)"];
      // console.log(result[0]["count(*)"]);
      res.render("home.ejs", { count });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB!");
  }
});

// Home to users
app.get("/new", (req, res) => {
  res.redirect("/user");
});

//============== Show Route ===============//
app.get("/user", (req, res) => {
  let q = "SELECT * FROM user";
  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      // console.log(result);
      // res.send(result);
      res.render("showusers.ejs", { users });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
});

//=============== ADD User ===============//
app.get("/newuser", (req, res) => {
  res.render("adduser.ejs");
});

// app.post("/newuser/user", (req, res) => {
//   let q = `INSERT INTO user (username, email, password) VALUES (?, ?, ?)`;
//   try {
//     connection.query(q, (err, users) => {
//       if (err) throw err;
//       // console.log(result);
//       // res.send(result);
//       res.render("adduser.ejs");
//     });
//   } catch (err) {
//     console.log(err);
//     res.send("Some error in DB");
//   }
//   // res.render("adduser.ejs");
// });

//----------------
app.post("/newuser/user", (req, res) => {
  let { username, email, password } = req.body;
  let q = `INSERT INTO user (username, email, password) VALUES (?, ?, ?)`;
  let values = [username, email, password];

  connection.query(q, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.send("Some error in DB");
    }
    console.log("User Added:", result);
    res.redirect("/user");
  });
});

//================ Edit Route ==================//
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      // console.log(result[0]);
      let user = result[0];
      res.render("edituser.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
});

//================ Update (DB) Route ==================//
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formPass, username: newUsername } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (formPass != user.password) {
        res.send("Wrong Password!");
      } else {
        let q2 = `UPDATE user SET username='${newUsername}' WHERE id='${id}' `;
        connection.query(q2, (err, result) => {});
        if (err) throw err;
        console.log(result);
        res.redirect("/user");
      }
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
  // res.send("Updated");
});

//================ Delete  Route ==================//
app.get("/user/:id", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      // console.log(result[0]);
      let user = result[0];
      res.render("deleteuser.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
});

//================ Delete (User) ==================//
app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let { email: userEmail, password: formPass } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (formPass != user.password) {
        res.send("Wrong Password!");
      } else {
        // let q2 = `UPDATE user SET username='${newUsername}' WHERE id='${id}' `;
        let q3 = `DELETE FROM user WHERE id='${id}' `;
        connection.query(q3, (err, result) => {});
        if (err) throw err;
        console.log(result);
        res.redirect("/user");
      }
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
  // res.send("Updated");
});

app.listen(port, () => {
  console.log(`Server Start : http://localhost:3000/`);
});
