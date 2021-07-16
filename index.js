// const { Client, MessageAttachment } = require('discord.js');
const Discord = require('discord.js');
const client = new Discord.Client();

const config = require("./config.json")
const custom = require("./custom.json")
const command = require("./commands")
const cfgMessage = require("./configMessage")
const path = require('path');
const http = require('https');
const fs = require('fs');

const exampleEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Configuracion')
    .setAuthor('Config', 'https://imgur.com/qKHN5pC.png')
    .setDescription('Para configurar el bot reacciona a la 🔧')
    .setThumbnail('https://imgur.com/qKHN5pC.png')
    .setImage('https://imgur.com/qKHN5pC.png')
    .setTimestamp()
    .setFooter('Gracias por utilizarme :D', 'https://imgur.com/qKHN5pC.png');
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setStatus('online')

    // cfgMessage(client, '689837249508278294', "Hello", ['🔧'])
    command(client, config.commands.map(key => { return key.command }), (msg) => {
        const action = config.commands.map(key => { if (key.command === msg.content) return key.action });
        msg.channel.send(action)
    })
    command(client, "!addsong", (msg) => {
        let { content } = msg;
        var obj = {
            photos: custom.photos,
            songs: custom.songs
        };
        var attach = (msg.attachments)
        if (attach.array().length === 1) {
            content = content.replace("!addsong", " ").trim()

            attach = attach.array()[0]

            const pattern = new RegExp('^[A-Z]+$', 'i');
            if (!content.includes(' ') && pattern.test(content)) {
                const validate = custom.songs.map(key => {
                    if (key.command === content) {
                        return true
                    } else {
                        return false
                    }
                });
                if (!validate.includes(true)) {
                    const song = {
                        "command": content,
                        "name": attach.name,
                        "url": attach.url
                    }
                    obj.songs.push(song)
                    var json = JSON.stringify(obj);
                    fs.writeFile('custom.json', json, (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                } else {
                    msg.channel.send("Ya hay una cancion con ese comando")
                }
            } else {
                msg.channel.send("El comando no tiene el nombre correcto tiene que ser solo letras y sin espacios")
            }
        } else {
            msg.channel.send("Se han añadido mas de 1 archivo")
        }

    })
    command(client, "!playsong", (msg) => {
        let { content } = msg;
        content = content.replace("!playsong", " ").trim()
        let url = undefined
        let name = undefined
        custom.songs.map(key => {
            if (key.command === content) {
                url = key.url;
                name = key.name;
            }
        });
        const request = http.get(url, function (response) {
            if (response.statusCode === 200) {
                var file = fs.createWriteStream(name);
                response.pipe(file);
                const channel = client.channels.cache.get("689837249508278297");
                if (channel != null) {
                    channel.join().then(connection => {
                        const dispatcher = connection.play(path.join(__dirname, name));
                        dispatcher.on("finish", end => {
                            fs.unlinkSync(path.join(__dirname, name))
                            channel.leave();
                        })
                    }).catch(err => console.log(err));
                }
            }
            request.setTimeout(60000, function () {
                msg.channel.send(`Fallo al reproducir la cancion ${name} con el comando ${content}`) // if after 60s file not downlaoded, we abort a request 
                request.abort();
            });
        });

    })
    command(client, "!addphoto", (msg) => {
        let { content } = msg;
        var obj = {
            photos: custom.photos,
            songs: custom.songs
        };
        var attach = (msg.attachments)
        if (attach.array().length === 1) {
            content = content.replace("!addphoto", " ").trim()

            attach = attach.array()[0]

            const pattern = new RegExp('^[A-Z]+$', 'i');
            if (!content.includes(' ') && pattern.test(content)) {
                const validate = custom.photos.map(key => {
                    if (key.command === content) {
                        return true
                    } else {
                        return false
                    }
                });
                if (!validate.includes(true)) {
                    const photo = {
                        "command": content,
                        "url": attach.url
                    }
                    obj.photos.push(photo)
                    var json = JSON.stringify(obj);
                    fs.writeFile('custom.json', json, (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                } else {
                    msg.channel.send("Ya hay una cancion con ese comando")
                }
            } else {
                msg.channel.send("El comando no tiene el nombre correcto tiene que ser solo letras y sin espacios")
            }
        } else {
            msg.channel.send("Se han añadido mas de 1 archivo")
        }

    })
    command(client, "!showphoto", (msg) => {
        let { content } = msg;
        content = content.replace("!showphoto", " ").trim()
        let url = undefined
        custom.photos.map(key => {
            if (key.command === content) {
                url = key.url;
            }
        });
        const attachment = new Discord.MessageAttachment(url);
        msg.channel.send(attachment);

    })
    command(client, "!CreateConfig", (msg) => {

        var role = msg.guild.roles.cache.find(role => role.name === "PsicoAdmin");
        if (role) {
            msg.channel.send("Ya existe el rol de configuracion escriba !config para configurar");
        } else {
            msg.guild.roles.create({
                data: {
                    name: 'PsicoAdmin',
                    color: 'BLUE',
                },
            })
        }
    })
    command(client, "!Config", (msg) => {
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Configuracion')
            .setAuthor('Config', 'https://imgur.com/qKHN5pC.png')
            .setDescription('Para configurar el bot reacciona a la 🔧')
            .setThumbnail('https://imgur.com/qKHN5pC.png')
            .setImage('https://imgur.com/qKHN5pC.png')
            .setTimestamp()
            .setFooter('Gracias por utilizarme :D', 'https://imgur.com/qKHN5pC.png');
        var role = msg.member.roles.cache.find(role => role.name === "PsicoAdmin");
        const filter = (reaction, user) => {
            return ['🔧'].includes(reaction.emoji.name) && user.id === msg.author.id;
        };
        if (role) {
            msg.author.send(exampleEmbed).then((msg) => {
                msg.react(`🔧`)
                msg.awaitReactions(filter, { max: 2, time: 60000, errors: ['time'] })
                    .then(collected => {
                        const reaction = collected.first();
                        if (reaction.emoji.name === '🔧') {

                        }
                    })
            });
        }
    })

});
client.on('message', msg => {




});
// client.on("guildCreate", guild => {

//     client.users.cache.get(guild.ownerID).send('Comeme la polla');
// });
// client.on('voiceStateUpdate', (oldMember, newMember) => {
//     let newUserChannel = newMember
//     let oldUserChannel = oldMember
//     const channel = client.channels.cache.get(channel_id);


//     if (newUserChannel.channelID === channel_id) {
//         channel.join()

//     } else if (oldUserChannel.channelID === channel_id) {
//         var mems = channel.members;
//         if (mems.size == 1) {
//             if (oldUserChannel.guild.me.voice.channel != null) {
//                 oldUserChannel.guild.me.voice.channel.leave()
//             }

//         }
//     }
// });
// client.on('guildMemberAdd',member =>{
//     // member
// });
client.on('message', msg => {

    const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Configuracion')
        .setAuthor('Config', 'https://imgur.com/qKHN5pC.png')
        .setDescription('Para configurar el bot reacciona a la 🔧')
        .setThumbnail('https://imgur.com/qKHN5pC.png')
        .setImage('https://imgur.com/qKHN5pC.png')
        .setTimestamp()
        .setFooter('Gracias por utilizarme :D', 'https://imgur.com/qKHN5pC.png');
    const filter = (reaction, user) => {
        return ['🔧'].includes(reaction.emoji.name) && user.id === msg.author.id;
    };
    if (msg.content === '!react') {
        client.users.cache.get("247804268378193921").send(exampleEmbed).then((msg) => {
            msg.react(`🔧`)
            msg.awaitReactions(filter, { max: 2, time: 60000, errors: ['time'] })
                .then(collected => {
                    const reaction = collected.first();
                    if (reaction.emoji.name === '🔧') {

                    }
                })
        });
    }


});


client.login(config.token)