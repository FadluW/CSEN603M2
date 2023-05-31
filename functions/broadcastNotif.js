const fs = require('fs')

module.exports = 
    /**
    * @param {*} notifMsg optional message sent in by user 
    * @returns Array of account objects belonging to given username
    */
    function (notifMsg = "Nothing") {
        const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`))

        for (let user in Users) {
            if (Users[user]?.notifs == undefined) {
                Users[user].notifs = [];
            }

            Users[user].notifs.push(notifMsg)
        }

        fs.writeFile(`./localDB/users.json`, JSON.stringify(Users), 'utf8', (err) => {
            if (err) {
                console.log(err);
                throw new Error('Failed to save DB')
            }
        })
    }