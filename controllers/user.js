const { user } = require("../models/UserModel");
const bcrypt = require("bcryptjs");

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
    'phoneNumber': payload.phoneNumber,
    'name': payload.fullName,
    'password': payload.password
  }
  const db_endpoint = `http://admin:security@localhost:5984`
  const userDB = new PouchDB(`${db_endpoint}/_users`)
  const eventsDB = new PouchDB(`${db_endpoint}/user-${payload.userId}-events`)
  const taskDB = new PouchDB(`${db_endpoint}/user-${payload.userId}-tasks`)
  const todoDB = new PouchDB(`${db_endpoint}/prefs-${payload.userId}-todos`)
  const createDbs = []
  const permissionAction = []
  userDB.put(user).then(()=>{
    createDbs.push(eventsDB)
    createDbs.push(taskDB)
    createDbs.push(todoDB)
    return Promise.allSettled(createDbs)
  }).then((rs)=>{
    return Promise.allSettled([eventsDB.info(), taskDB.info(), todoDB.info()])
  }).then((a)=>{
    console.log('here',a);
    permissionAction.push(addPermission(`${db_endpoint}/user-${payload.userId}-events`, role))
    permissionAction.push(addPermission(`${db_endpoint}/user-${payload.userId}-tasks`, role))
    permissionAction.push(addPermission(`${db_endpoint}/user-${payload.userId}-todos`, role))
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
