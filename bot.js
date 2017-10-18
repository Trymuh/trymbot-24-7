const Discord = require('discord.js');
const client = new Discord.Client();
const settings = require('./settings.json');
const num = null;
const yt = require('ytdl-core');
const tokens = require('./tokens.json');
const ffmpeg = require('ffmpeg');
const ytdl = require('ytdl-core');

client.on('ready',() => {
	console.log('I\'m Active')
  client.user.setGame('Help > $commands')

});

client.on("guildMemberAdd", member => {
	let guild = member.guild;
	  member.guild.defaultChannel.send(`Welcome to the Server, ${member}!`);
});

const prefix = "$";
client.on('message', message => {
	if (message.author === client.user) return;
	if (message.content.startsWith(prefix + 'ping')) {
		message.reply('pong');
	}
});

client.on('message', message => {
	if (message.author === client.user) return;
	if (message.content.startsWith(prefix + 'commands')) {
		message.reply('The commands available to you here: http://trymuh.tk');
	}
});
Client.login(proccess.env.BOT_TOKEN);
client.on('message', message => {
	if (message.author === client.user) return;
	if (message.content.startsWith(prefix + 'trymuh')) {
		message.reply('to find out the developers social media: http://trymuh.tk');
	}
	
});
client.on('message', message => {
	if (message.author === client.user) return;
	if (message.content.startsWith(prefix + 'drugs')) {
		message.reply('Dont do drugs kids');
	}
});
client.on('message', message => {
	if (message.author === client.user) return;
	if (message.content.startsWith(prefix + 'website')) {
		message.reply('head to https://polarservers.com and use code "polar16" at checkout for 25% off!');
	}
});	
client.on('message', message => {
	if (message.author === client.user) return;
	if (message.content.startsWith(prefix + 'sexy')) {
		message.reply('That would be my owner, not you!');
	}
});
client.on('message', message => {
		if (message.author === client.user) return;
		if (message.content.startsWith(prefix + 'purge')) {
			message.channel.bulkDelete(num);
			message.reply('Your channel has been cleared!');
		}
	}

);
let queue = {};

		const commands = {
			'play': (msg) => {
				if (queue[msg.guild.id] === undefined) return msg.channel.send(`Add some songs to the queue first with ${tokens.prefix}add`);
				if (!msg.guild.voiceConnection) return commands.join(msg).then(() => commands.play(msg));
				if (queue[msg.guild.id].playing) return msg.channel.send('Already Playing');
				let dispatcher;
				queue[msg.guild.id].playing = true;

				console.log(queue);
				(function play(song) {
					console.log(song);
					if (song === undefined) return msg.channel.send('Queue is empty').then(() => {
						queue[msg.guild.id].playing = false;
						msg.member.voiceChannel.leave();
					});
					msg.channel.send(`Playing: **${song.title}** as requested by: **${song.requester}**`);
					dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }), { passes : tokens.passes });
					let collector = msg.channel.createCollector(m => m);
					collector.on('send', m => {
						if (m.content.startsWith(tokens.prefix + 'pause')) {
							msg.channel.send('paused').then(() => {dispatcher.pause();});
						} else if (m.content.startsWith(tokens.prefix + 'resume')){
							msg.channel.send('resumed').then(() => {dispatcher.resume();});
						} else if (m.content.startsWith(tokens.prefix + 'skip')){
							msg.channel.send('skipped').then(() => {dispatcher.end();});
						} else if (m.content.startsWith('volume+')){
							if (Math.round(dispatcher.volume*50) >= 100) return msg.channel.send(`Volume: ${Math.round(dispatcher.volume*50)}%`);
							dispatcher.setVolume(Math.min((dispatcher.volume*50 + (2*(m.content.split('+').length-1)))/50,2));
							msg.channel.send(`Volume: ${Math.round(dispatcher.volume*50)}%`);
						} else if (m.content.startsWith('volume-')){
							if (Math.round(dispatcher.volume*50) <= 0) return msg.channel.send(`Volume: ${Math.round(dispatcher.volume*50)}%`);
							dispatcher.setVolume(Math.max((dispatcher.volume*50 - (2*(m.content.split('-').length-1)))/50,0));
							msg.channel.send(`Volume: ${Math.round(dispatcher.volume*50)}%`);
						} else if (m.content.startsWith(tokens.prefix + 'time')){
							msg.channel.send(`time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
						}
					});
					dispatcher.on('end', () => {
						collector.stop();
						play(queue[msg.guild.id].songs.shift());
					});
					dispatcher.on('error', (err) => {
						return msg.channel.send('error: ' + err).then(() => {
							collector.stop();
							play(queue[msg.guild.id].songs.shift());
						});
					});
				})(queue[msg.guild.id].songs.shift());
			},
			'join': (msg) => {
				return new Promise((resolve, reject) => {
					const voiceChannel = msg.member.voiceChannel;
					if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply('I couldn\'t connect to your voice channel...');
					voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
				});
			},
			'add': (msg) => {
				let url = msg.content.split(' ')[1];
				if (url == '' || url === undefined) return msg.channel.send(`You must add a YouTube video url, or id after ${tokens.prefix}add`);
				yt.getInfo(url, (err, info) => {
					if(err) return msg.channel.send('Invalid YouTube Link: ' + err);
					if (!queue.hasOwnProperty(msg.guild.id)) queue[msg.guild.id] = {}, queue[msg.guild.id].playing = false, queue[msg.guild.id].songs = [];
					queue[msg.guild.id].songs.push({url: url, title: info.title, requester: msg.author.username});
					msg.channel.send(`added **${info.title}** to the queue`);
				});
			},
			'queue': (msg) => {
				if (queue[msg.guild.id] === undefined) return msg.channel.send(`Add some songs to the queue first with ${tokens.prefix}add`);
				let tosend = [];
				queue[msg.guild.id].songs.forEach((song, i) => { tosend.push(`${i+1}. ${song.title} - Requested by: ${song.requester}`);});
				msg.channel.send(`__**${msg.guild.name}'s Music Queue:**__ Currently **${tosend.length}** songs queued ${(tosend.length > 15 ? '*[Only next 15 shown]*' : '')}\n\`\`\`${tosend.slice(0,15).join('\n')}\`\`\``);
			},
	
		};

		client.on('ready', () => {
			console.log('ready!');
		});

		client.on('message', msg => {
			if (!msg.content.startsWith(tokens.prefix)) return;
			if (commands.hasOwnProperty(msg.content.toLowerCase().slice(tokens.prefix.length).split(' ')[0])) commands[msg.content.toLowerCase().slice(tokens.prefix.length).split(' ')[0]](msg);
		});
	client.login(settings.token);
