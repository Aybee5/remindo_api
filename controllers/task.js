require("dotenv").config();
const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const agenda = require("../jobs/agenda");
const mailjet = require("node-mailjet").connect(
  process.env.MAILJET_PRIVATE,
  process.env.MAILJET_PUBLIC
);

async function scheduleSMS(data) {
  agenda.define(data.smsTitle, async (job) => {
    const { to, title } = job.attrs.data;
    client.messages
      .create({
        body: `Hello\n Your schedule event ${title}, is coming up in the next 5 minutes.\nCheck your email for details`,
        from: process.env.TWILIO_SMS_NUMBER,
        to: to,
      })
      .then((message) => console.log(message.sid));
  });
  try {
    const done = await agenda.schedule(data.startTime, data.smsTitle, {
      to: data.userPhone,
      title: data.title,
    });
    return done;
  } catch (error) {
    throw error;
  }
}

async function scheduleEmail(data) {
  agenda.define(data.emailTitle, async (job) => {
    const { to, fullName, title, detail, type } = job.attrs.data;
    if (type === "todo") {
      job.repeatEvery("0 7 * * 1-7", {
        skipImmediate: true,
      });
      await job.save();
    }
    const request = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "remindo@aybee.codes",
            Name: "Remindo Application",
          },
          To: [
            {
              Email: to,
              Name: fullName,
            },
          ],
          Subject: "Your Reminder is up",
          TextPart: "Reminder of event",
          HTMLPart: `Hello ${fullName} <br /> You have an upcoming ${type} titled ${title}. <br />Description: ${detail}.<br/> Check the app for more detail`,
          CustomID: "AppGettingStartedTest",
        },
      ],
    });
    request
      .then((result) => {
        console.log(result.body);
      })
      .catch((err) => {
        console.log(err.statusCode);
      });
  });
  try {
    const done = await agenda.schedule(data.startTime, data.emailTitle, {
      to: data.userEmail,
      fullName: data.fullName,
      title: data.title,
      type: data.type,
      detail: data.detail,
    });
    return done;
  } catch (error) {
    throw error;
  }
}

module.exports.add = async (req, res) => {
  const taskDetail = {
    title: req.body.title,
    userId: req.body.userId,
    userPhone: req.body.phoneNumber,
    userEmail: req.body.email,
    type: req.body.eventType,
    fullName: req.body.fullName,
    detail: req.body.description,
    emailTitle: req.body.emailTitle,
    smsTitle: req.body.smsTitle,
  };
  if (taskDetail.type === "event") {
    taskDetail.startTime = new Date(
      new Date(new Date(req.body.startTime).toISOString()).getTime() - 5 * 60000
    ).toISOString();
    taskDetail.endTime = new Date(req.body.endTime).toISOString();
  } else if (taskDetail.type === "task") {
    taskDetail.startTime = new Date(
      new Date(new Date(req.body.startTime).toISOString()).getTime() - 5 * 60000
    ).toISOString();
  } else taskDetail.startTime = new Date().toISOString();
  try {
    const jobs = [scheduleEmail(taskDetail)];
    if (taskDetail.type === "event") jobs.push(scheduleSMS(taskDetail));
    const response = await Promise.allSettled(jobs);
    console.log(response);
    return res
      .status(201)
      .json({ status: true, msg: "agenda created successfully" });
  } catch (error) {
    console.log(error);
  }
};
