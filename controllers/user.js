const { user } = require("../models/UserModel");
const PouchDB = require('pouchdb');
const bcrypt = require("bcryptjs");
const axios =  require('axios')

const db_endpoint = process.env.COUCH_DB_URL

const addPermission = (db_endpoint, permission) => {
  const endpoint = `${db_endpoint}/_security`
  return axios.get(endpoint).then(response => response.data).then(permissions => {
      permissions.members.roles.push(permission)
      return axios.put(endpoint, permissions)
  }).catch(e => {
      // console.log(e)
      throw e
      return e
  })
}

module.exports.register = (req, res) => {
  const payload = req.body
  payload.userId = payload.userId.toLowerCase()
  const role = `user_${payload.userId}`
  
  const user = {
    "_id": `org.couchdb.user:${payload.email}`,
    'type': 'user',
    'roles': [`${role}`],
    'email': payload.email,
    'userId': payload.userId,
    'name': payload.email,
    'phoneNumber': payload.phoneNumber,
    'fullName': payload.fullName,
    'origin': 'remindo',
    'canEmail':true,
    'canSMS': true,
    'password': payload.password
  }
  console.log({user});
  const userDB = new PouchDB(`${db_endpoint}/_users`)
  const userAgenda = new PouchDB(`${db_endpoint}/user-${payload.userId}-agendas`)
  const createDbs = []
  const permissionAction = []
  userDB.put(user).then(()=>{
    createDbs.push(userAgenda)
    return Promise.allSettled(createDbs)
  }).then((rs)=>{
    return userAgenda.info()
  }).then((a)=>{
    console.log('here',a);
    permissionAction.push(addPermission(`${db_endpoint}/user-${payload.userId}-agendas`, role))
    return Promise.allSettled(permissionAction)
  }).then(()=>{
    res.status(201).json({msg: "sucess", user})
  }).catch(err=>{
    res.status(400).json({msg: "Error", err})
  })
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

module.exports.getUser = async (req, res) =>{
  console.log(`${db_endpoint}/_users/org.couchdb.user:${req.body.username}`);
  axios.get(`${db_endpoint}/_users/org.couchdb.user:${req.body.username}`).then(result=>{
    console.log({result});
    res.status(200).json({user:result.data})
  }).catch(err=>{
    console.log({err});
  })
}
