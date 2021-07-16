module.exports = (client, aliases, callback) => {

    if (typeof aliases === 'string') {
        aliases = [aliases]
    }
    client.on('message', msg => {
        const { content } = msg;

        aliases.forEach(alias => {
            const command = `${alias}`
            if (content.startsWith(`${command}`) || content === command) {
                callback(msg)
            }
        });

    })
}