const fs = require('fs');

module.exports = 
    /**
    * Sends request to close and account and temporarily remove from user who owns it
    * Throws apropriate errors.
    * @param {*} username
    * @param {*} accountNumber account number to be closed
    * @returns 
    */
    function (reqID) {
        // Import DB
        const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`))
        const Requests = JSON.parse(fs.readFileSync(`./localDB/requests.json`))
   
        // Ensure user exists
        if (Users[username] == undefined) {
            throw new Error(`Username ${username} is not registered`);
        }

        // Ensure if client, they own the account
        if (Users[username].userType == "client" && !Users[username].accountIDs.includes(accountNumber)) {
            throw new Error(`Cannot close an account you do not own.`)
        }

        // Ensure user has more than one account
        if (Users[username].accountIDs.length < 2) {
            throw new Error("You have to have at least one account left open.")
        }

        // Generate request object
        let randReqID = Date.now().toString(16);
        Requests.accountClose[randReqID] = {
            username: username,
            accNumber: accountNumber,
            createdOn: Date.now()
        }

        // Remove account temporarily from user
        let accIndex = Users[username].accountIDs.indexOf(accountNumber);
        Users[username].accountIDs.splice(accIndex, 1);

        fs.writeFile(`./localDB/users.json`, JSON.stringify(Users), 'utf8', (err) => {
            if (err) {
                console.log(err);
                throw new Error('Failed to save DB')
            } else {
                console.log(`Removed account ${accountNumber} from ${username}`)
            }
        })
        fs.writeFile(`./localDB/requests.json`, JSON.stringify(Requests), 'utf8', (err) => {
            if (err) {
                console.log(err);
                throw new Error('Failed to save DB')
            } else {
                console.log(`Requested to close account ${accountNumber}`)
            }
        })
   }