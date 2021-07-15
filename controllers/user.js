const { user } = require("../models/UserModel");
const bcrypt = require("bcryptjs");

module.exports.signup = (req, res) => {
  user
    .findOne({ email: req.body.email })
    .then((user) => {
      if (user)
        return req
          .status(409)
          .json({ status: false, msg: "User with the email already exists" });
      const userDetail = {
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
      };
      bcrypt
        .hash(req.body.password, 10)
        .then((result) => {
          return (userDetail.password = result);
        })
        .then(() => {
          return user.save(userDetail);
        })
        .then((result) => {
          req
            .status(201)
            .json({ status: true, msg: "User created sucessfully" });
        })
        .catch((err) => {
          req.status(500).json({ status: false, msg: "An error occured", err });
        });
    })
    .catch((err) => {
      req.status(500).json({ status: false, msg: "An error occured", err });
    });
};

module.exports.login = (req, res) => {
  user.findOne({ email: req.body.email }).then((user) => {
    if (!user)
      return res.status(404).json({ status: false, msg: "User not found" });
    bcrypt.compare(req.body.password, user.password).then((result) => {
      if (!result)
        return req.status(401).json({ status: false, msg: "Wrong Password" });
      return req.status(200).json({ status: true, msg: "Correct Password" });
    });
  });
};
