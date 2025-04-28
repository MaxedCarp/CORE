//Declaration
const { Client, Events, GatewayIntentBits, Partials } = require('discord.js');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const { MongoClient } = require('mongodb');
const clc = require('cli-color');
const { token, dbusr, dbpwd, addr, activedb } = require('./config.json');
const fs = require('node:fs');
const fs2 = require('./fsfuncs');
const path = require('node:path');
const essentials = require('./essentials.js');
const client = new Client({ intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent], partials: [Partials.Channel, Partials.Message] });


//Initialization
client.once(Events.ClientReady, async c => {
	console.log(`${clc.red(await printLines())} lines of code found!\nLogged in as ${clc.red(c.user.tag)}.`);
	global.client = client;
	global.connections = {};
	global.mongo = await MongoClient.connect(`mongodb://${dbusr}:${dbpwd}@${addr}`);
	global.db = global.mongo.db(activedb);
	eventEmitter.emit('keepAlive');
	eventEmitter.emit('keepAliveCheck');
});
client.login(token);

process.on('uncaughtException', async (err) => {
  console.error(`Caught exception: ${err.stack}`);
  let dmChannel = await client.users.createDM("275305152842301440");
  await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] ${err.stack}`);
});

async function UpdateKeep_Alive(){
	await global.mongo.db("global").collection("availability").updateOne({name: activedb}, { $set: {lastreported: Math.floor(await essentials.parsetime(Date.now() + "ms","s")), uptime: client.uptime } });
}
var keep_alive = function () {
	setInterval(UpdateKeep_Alive, 5000);
}
async function CheckKeep_Alive(){
	let data = await global.mongo.db("global").collection("availability").find().toArray();
	for (let i = 0; i <data.length; i++) {
		let doc = data[i];
		console.log(doc);
		if ((doc.lastreported + 10 < Math.floor(new Date().valueOf() / 1000)) && doc.report === true && doc.lastreported !== 0) {
			let dmChannel = await client.users.createDM("275305152842301440");
			await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] \`\`\`diff\n- PROCESS "${doc.name}" DOWN!!!\n\`\`\``);
			await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] \`\`\`diff\n- PROCESS "${doc.name}" DOWN!!!\n\`\`\``);
			await dmChannel.send(`[<t:${Math.floor(new Date().valueOf() / 1000)}:f>] \`\`\`diff\n- PROCESS "${doc.name}" DOWN!!!\n\`\`\``);
		}
	}
}
var keep_aliveCheck = function () {
	setInterval(CheckKeep_Alive, 10000);
}

eventEmitter.on('keepAlive', keep_alive);
eventEmitter.on('keepAliveCheck', keep_aliveCheck);
//Interaction Event

//------------------------------------- Functions
async function printLines() {
    let count = 0;
    const baseFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js'));
    for (const file of baseFiles) {
        const filePath = path.join(__dirname, file);
        count += await fs2.countlines(filePath);
    }
    return count;
}