const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const token = require("../middleware/authToken");
require("dotenv").config;

// http://localhost:5000/auth/register
// POST
// Register new user

router.post("/register", (req, res) => {
  const { email, user_name, first_name, last_name, password } = req.body;

  if (!email || !user_name || !first_name || !last_name || !password)
    return res.status(400).json({ msg: "Enter All Fields" });

  let emailValidator =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!email.match(emailValidator))
    return res.status(400).json({ msg: "Invalid Email" });

  const newUser = new User({
    email,
    user_name,
    first_name,
    last_name,
    password,
  });

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;

      User.findOne({ email: email })
        .select("-password")
        .then((user) => {
          if (!user) {
            newUser
              .save()
              .then((user) => {
                jwt.sign(
                  {
                    id: user._id,
                  },
                  process.env.SECRET_TOKEN,
                  (err, token) => {
                    if (err) throw err;

                    res.status(200).json({
                      _id: user._id,
                      email: user.email,
                      user_name: user.user_name,
                      first_name: user.first_name,
                      last_name: user.last_name,
                      followers: user.followers,
                      following: user.following,
                      token,
                    });
                  }
                );
              })
              .catch((err) => console.log(err));
          } else {
            res.status(400).json({ msg: "Email Already Exists" });
          }
        });
    });
  });
});

// http://localhost:5000/auth/login
// POST
// Login user

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  console.log(password);

  if (!email || !password)
    return res.status(400).json({ msg: "Enter All Fields" });

  User.findOne({ email }).then((user) => {
    if (!user) return res.status(400).json({ msg: "Email Not Found" });
    bcrypt.compare(password, user.password).then((isValid) => {
      if (!isValid) return res.status(400).json({ msg: "Invalid Password" });

      jwt.sign({ id: user._id }, process.env.SECRET_TOKEN, (err, token) => {
        if (err) throw err;
        console.log("Logedin");

        res.status(200).json({
          _id: user._id,
          email: user.email,
          user_name: user.user_name,
          first_name: user.first_name,
          last_name: user.last_name,
          followers: user.followers,
          following: user.following,
          token,
        });
      });
    });
  });
});

// http://localhost:5000/auth/user
// GET
// GET USER

router.get("/user", token, (req, res) => {
  User.findById(req.user.id)
    .select("-password")
    .then((user) => res.status(200).json(user))
    .catch((err) => res.status(400).json(err));
});

module.exports = router;
