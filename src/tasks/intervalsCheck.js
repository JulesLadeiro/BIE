const moment = require('moment');
const { getAgendaCrypted, getNotesCrypted } = require('../api/mgapi');
const { createData, deleteData, getAllData, updateData } = require('../firebase/firebase');
const { statsAddRemind } = require('../functions/stats');
const { getNotesCryptedInDb, setNotesCryptedInDb } = require('../functions/note');

const getCustomizedDate = (semaine = 0) => {
    const date = moment().add(semaine, "weeks");

    if (date.isoWeekday() >= 6) {
        date.add(1, 'weeks');
    }
    return date.isoWeekday(1);
}

const mygesCheck = (client) => {
    setInterval(async () => {
        for (let i = 0; i < 3; i++) {
            const date = getCustomizedDate(i).format("YYYY-MM-DD");
            const edt = await getAllData("edt");
            if (edt[date]) {
                if (edt[date].myges != 'OLD' && edt[date].myges != 'UNDEFINED') {
                    const myges = await getAgendaCrypted({ start: date, end: moment(date, "YYYY-MM-DD").add(7, "days").format("YYYY-MM-DD") });
                    if (edt[date].myges != myges) {
                        await updateData("edt", date, { myges: 'OLD' });
                        client.channels.cache.get("995994128234057779").send(`<@676690539126718467> | L'EDT du ${moment(date, "YYYY-MM-DD").format("DD/MM/YYYY")} a changé !`).catch(() => { ; });
                    }
                }
            } else {
                await createData("edt", date, { link: '', desc: false, myges: 'UNDEFINED' });
                client.channels.cache.get("995994128234057779").send(`<@676690539126718467> | L'EDT du ${moment(date, "YYYY-MM-DD").format("DD/MM/YYYY")} est vide !`).catch(() => { ; });
            }
        }
    }, 600000)
}

// Envoi automatique d'emploi du temps
const edtSenderCheck = async (client) => {
    const mygesCooldown = new Set();
    let lastPastille = '<:question:997270154490679348>';
    const askMyges = async (edt, edtDate) => {
        return new Promise(async (resolve) => {
            let pastille;
            let myges;
            if (!mygesCooldown.has('cd')) {
                try {
                    myges = await getAgendaCrypted({ start: edtDate, end: edtDate });
                    pastille = (edt[edtDate].myges == myges ? '<:check:866581082551615489>' : '<:question:997270154490679348>');
                } catch {
                    pastille = '<:uncheck:866581082870513684>';
                }
                lastPastille = pastille
                mygesCooldown.add('cd');
                setTimeout(() => {
                    mygesCooldown.delete('cd');
                }, 600000);
                resolve(pastille);
            } else {
                resolve(lastPastille);
            }
        })
    }
    setInterval(async () => {
        try {
            const date = new Date();
            if (date.getHours() >= 18 && date.getHours() <= 19 && date.getDay() == 5) {
                const currentDate = getCustomizedDate(1).format("YYYY-MM-DD");
                const edtsub = await getAllData('edtsub');
                const edt = await getAllData('edt')
                for (const [key, val] of Object.entries(edtsub)) {
                    if (val.sended != currentDate) {
                        updateData('edtsub', key, { sended: currentDate });
                        if (!edt[currentDate] || edt[currentDate].myges == 'UNDEFINED') {
                            return (client.channels.cache.get("995994128234057779")).send(`<@676690539126718467> | <@${key}> waits EDT 1 ${currentDate}\n\`&edt sendmp ${currentDate} ${key} 1\``).catch(() => { })
                        } else {
                            // send
                            const userToSend = await client.users.fetch(key);
                            const pastille = await askMyges(edt, currentDate);
                            const dateFinale = moment().format("DD/MM/YYYY");
                            await userToSend.send({ content: `*Réception automatique <#991371617043222638>*\n🗓️ **__${dateFinale}__ ${pastille} Voici l'emploi du temps de la semaine prochaine**`, files: [edt[currentDate].link] }).catch(() => { ; });
                        }
                    }
                }
            }
        } catch (e) {
        }
    }, 600000)
}

// Vérification des rappels d'horraires
const edtReminderCheck = (client) => {
    setInterval(async () => {
        const date = moment();
        const currentDatefinale = date.add(1, "days").format("YYYY-MM-DD");
        if (parseInt(date.format("hh")) >= 17) {
            const edtremind = await getAllData("edtremind");
            if (!edtremind[currentDatefinale]?.hour) return;
            statsAddRemind();
            await deleteData('edtremind', currentDatefinale);
            await (client.channels.cache.get(`762698661892849714`)).send(`<@&996043089309347941> <a:bell:868901922483097661> Vous commencez à **${edtremind[currentDatefinale].hour}** demain !`).catch(() => { ; });
        }
    }, 57000)
}

// Vérification des notes actuelles
const currentNotesCheck = (client) => {
    setInterval(async () => {
        const oldNotes = await getNotesCryptedInDb();
        const currentNotes = await getNotesCrypted();
        if (!oldNotes || currentNotes != oldNotes) {
            await (client.channels.cache.get(`995994128234057779`)).send(`<@676690539126718467> 💯 **Vos notes viennent de changer**`).catch(() => { });
            await setNotesCryptedInDb(currentNotes);
        }
    }, 1800000)
}

module.exports = { edtReminderCheck, edtSenderCheck, mygesCheck, currentNotesCheck }