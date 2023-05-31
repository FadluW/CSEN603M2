const fs = require('fs');

module.exports = 
    /**
    * Add a new account linked to a user to the file system database.
    * Throws apropriate errors.
    * @param {*} username
    * @param {*} accountNumber assign a specific account number, else randomly generate it (optional)
    * @returns 
    */
    function (username, accountNumber) {
        // Import DB
        const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`))
        const Requests = JSON.parse(fs.readFileSync(`./localDB/requests.json`))
   
        // Ensure user exists
        if (Users[username] == undefined) {
            throw new Error(`Username ${username} is not registered`);
        }

        // Ensure user has more than one account
        if (Users[username].accountIDs.length < 2) {
            throw new Error("You have to have at least one account left open.")
        }

        // Generate request object
        let randReqID = Date.now().toString(16);
        Requests.account[randReqID] = {
            username: username,
            accNumber: accountNumber,
            createdOn: Date.now()
        }

        fs.writeFile(`./localDB/requests.json`, JSON.stringify(Requests), 'utf8', (err) => {
            if (err) {
                console.log(err);
                throw new Error('Failed to save DB')
            } else {
                console.log(`Requested to close account ${accountNumber}`)
            }
        })
   }