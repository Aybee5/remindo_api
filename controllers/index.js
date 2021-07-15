require("dotenv").config()
const nodemailer = require('nodemailer')
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const agenda = require("../jobs/agenda")
const Task = require('../models/taskModel')


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_ID,
    pass: process.env.GMAIL_PASS
  }
})

async function scheduleSMS(data) {
  const agendaSMSTitle = `SMS-${Date.now().toString(32)}`
  agenda.define(agendaSMSTitle, async(job)=>{
    client.messages
      .create({body: `Hello\n You schedule an event ${job.attrs.title}.\nCheck your email for details`, from: process.env.TWILIO_SMS_NUMBER, to: job.attrs.to})
      .then(message => console.log(message.sid));
  })
  agenda.schedule(data.time, agendaSMSTitle, {
    title: data.title,
    to: data.to
  })
}

async function scheduleEmail(data) {
  const agendaEmailTitle = `Email-${Date.now().toString(32)}`
  const mailOption = {
    from: process.env.EMAIL_ID,
    to: data.to,
    subject: "Your agenda is up!",
    text: `Hello\n You have an upcoming agenda ${data.title}.\nDetails: ${data.detail}\n Check the app for details`
  }

  agenda.define(agendaEmailTitle, async(job)=>{
    let emailInfo = await transporter.sendMail(mailOption)

  })
  agenda.schedule(data.time, agendaEmailTitle)
}

module.exports.add = async (req, res) =>{
  const taskDetail =  {
    title: req.body.title,
    type: req.body.type,
    detail: req.body.detail,
    startTime: new Date(req.body.startTime).toISOString(),
    endTime: new Date(req.body.endTime).toISOString()
  }
  if (taskDetail.type === 'event') {
    Task.find({
      startTime: {
        $gte: new Date(taskDetail.startTime).toISOString(),
        $lt: new Date(taskDetail.endTime).toISOString()
      }
    }).then(result=>{
      if (result) return req.status(409).json({status: false, msg: "Event exists on the timeframe"})
      scheduleSMS().catch(console.error)
    })
  }
  Task.create(taskDetail).then(result=>{
    const emailData =  {
      to: req.body.user.email,
      title: req.body.title,
      detail: req.body.detail,
      time: req.body.startTime
    }
    scheduleEmail(emailData).catch(console.error)
    req.status(201).json({status: true, msg: "agenda created successfully"})
  })
}