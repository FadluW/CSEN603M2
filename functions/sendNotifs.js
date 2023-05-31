const fs = require('fs')

module.exports = 
    /**
    * Freeze Card and submit request
    * @param {*} username
    * @param {*} notifMsg optional message sent in by user 
    * @returns Array of account objects belonging to given username
    */
    function (username, notifMsg = "Nothing") {
        const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`))

        if (Users[username]?.notifs == undefined) {
            Users[username].notifs = [];
        }

        Users[username].notifs.push(notifMsg)

        fs.writeFile(`./localDB/users.json`, JSON.stringify(Users), 'utf8', (err) => {
            if (err) {
                console.log(err);
                throw new Error('Failed to save DB')
            }
        })
    }