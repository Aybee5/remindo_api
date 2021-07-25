const Agenda =  require('agenda')
require('dotenv').config();
const agenda = new Agenda({db: {address: process.env.DB_URL, collection: 'agenda'}})
agenda.on("ready", async ()=> await agenda.start())

module.exports = agenda