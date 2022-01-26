import { Message } from "discord.js";

const interactionLaunch = (interaction: any, client: any) => {
    if (interaction.isButton()) {
        switch (interaction.customId) {
            case 'EDT1':
                interaction.user.send({ content: "EDT1", ephemeral: true })
                break;
            case 'EDT2':
                interaction.user.send({ content: "EDT2", ephemeral: true })
                break;
            case 'EDT3':
                interaction.user.send({ content: "EDT3", ephemeral: true })
                break;
            case 'DEV':
                interaction.user.send({ content: "DEV", ephemeral: true })
                break;
            case 'DEVSTATS':
                interaction.user.send({ content: "STATS", ephemeral: true })
                break;
            default: return;
        }
        interaction.deferUpdate()
    }
}

const checkAlias = (commandName: string) => {
    switch (commandName) {
        // case 'h':
        // case 'aide':
        // case 'hjelp': // help
        //     commandName = 'help'; break;
        // case 'rmd':
        // case 'rmdm':
        // case 'rmdme': // remind me
        //     commandName = 'remindme'; break;
        // case 'lang':
        // case 'langue':
        // case 'språk':
        // case 'sprak': // language
        //     commandName = 'language'; break;
        // case 'invite':
        // case 'invitasjon':
        // case 'invitere ': // invitation
        //     commandName = 'invitation'; break;
        // case 'p':
        // case 'profil': // profile
        //     commandName = 'profile'; break;
        // case 'not':
        //     commandName = 'notification'; break;
        // case 'klan':
        // case 'c': // clan
        //     commandName = 'clan'; break;
        // case 'suggestions':
        // case 'sugg': // suggestion
        //     commandName = 'suggestion'; break;
        // case 'server':
        // case 'serveur':
        // case 'g':
        // case 'guilde': // guild
        //     commandName = 'guild'; break;
        // case 'ro':
        // case 'r': // role
        //     commandName = 'role'; break;
        // case 'remind':
        // case 'autoremind':
        // case 'autoreminder':
        // case 'rm':
        // case 'reminder': // reminder
        // // commandName = 'reminder'; try { if (args[0].toLowerCase() == `add`) { args = msg.content.split('"'); args[0] = args[0].split(" ")[2]; var secondArgs = args[2].split(" "); args[2] = secondArgs[1]; args.push(secondArgs[2]); break; } } catch (error) { if (lang[msg.author.id] === `FR`) return msg.channel.send(`La commande est \`&reminder add [dd/mm/yyyy] "[ReminderTitle]" [#TextChannel] [@RoleToMention]\` <@${msg.author.id}>, le rôle à mentionner n'est pas obligatoire !`).catch(() => { ; }); else if (lang[msg.author.id] === `NO`) return msg.channel.send(`Ordren er \`&reminder add [dd/mm/yyyy] "[ReminderTitle]" [#TextChannel] [@RoleToMention]\` <@${msg.author.id}>, rollen som skal nevnes er ikke obligatorisk!`).catch(() => { ; }); else return msg.channel.send(`The command is \`&reminder add [dd/mm/yyyy] "[ReminderTitle]" [#TextChannel] [@RoleToMention]\` <@${msg.author.id}>, the role to be mentioned is not mandatory!`).catch(() => { ; }); }; break;
        
        case 'e': // edt command PRIVATE
        case 'edt':
        case 'emploidutemps': 
        case 'emploidutemp':
            commandName = 'edt'; break;
        case 'devoirs': // devoir command PRIVATE
        case 'dev':
        case 'd':
            commandName = 'devoir'; break;
        case 'stat': // stats command PRIVATE
        case 's':
            commandName = 'stats'; break;
        default:
            break;
    }
    return commandName
}

const commandLaunch = async (msg: Message<any>, config: { prefix: any; owner?: string; }, client: any) => {
    let prefix = config.prefix;
    // if (msg.channel.type != `DM`) {
    //     if (customprefix[msg.guild.id]) {
    //         prefix = customprefix[msg.guild.id];
    //     }
    // }
    // if (msg.content.toLowerCase() == `&prefix`) return msg.reply(`\`${prefix}\` is the current prefix.`).catch(() => { ; });
    if (!msg.content.startsWith(prefix)) return;
    let args = msg.content.slice(prefix.length).split(/ +/);
    let commandName = checkAlias(args.shift().toLowerCase());

    if (!client.commands.has(commandName)) return;
    const command = client.commands.get(commandName);
    if (command.guildOnly && msg.channel.type != 'GUILD_TEXT') {
        return msg.reply('Vous devez taper cette commande dans un serveur Discord !').catch(() => { ; });
    }

    try {
        await command.execute(msg, args, client, prefix);
    } catch (error) {
        client.channels.cache.get('922139628729958400').send(`Error CMD[${commandName}] was generated by <@${msg.author.id}>-${msg.author.id}-${msg.author.username}#${msg.author.discriminator}\n\`${msg.content}\`\n\`\`\`${error}\`\`\``).catch(() => { ; });
    }
};

export { commandLaunch, interactionLaunch }