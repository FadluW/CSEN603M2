const fs = require('fs');

module.exports = 
    /**
    * Add a new account linked to a user to the file system database.
    * Throws apropriate errors.
    * @param {*} username
    * @returns 
    */
    function (username, accountNum) {
        // Import DB
        const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`))
        const Requests = JSON.parse(fs.readFileSync(`./localDB/requests.json`))
   
        // Ensure user exists
        if (Users[username] == undefined) {
            throw new Error(`Username ${username} is not registered`);
        }

        // Generate request object
        let randReqID = Date.now().toString(16);
        Requests.card[randReqID] = {
            username: username,
            accountNum: accountNum,
            createdOn: Date.now()
        }

        fs.writeFile(`./localDB/requests.json`, JSON.stringify(Requests), 'utf8', (err) => {
            if (err) {
                console.log(err);
                throw new Error('Failed to save DB')
            }
        })
   }