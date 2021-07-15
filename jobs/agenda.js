const Agenda =  require('agenda')
const agenda = new Agenda({db: {address: process.env.DB_URL, collection: 'agenda'}})

agenda.on("ready", async ()=> await agenda.start())

agenda.define("Daily Email ")

module.exports = agenda