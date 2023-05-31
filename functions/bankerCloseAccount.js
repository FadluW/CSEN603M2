const fs = require('fs');

module.exports = 
    /**
    * Add a new account linked to a user to the file system database.
    * Throws apropriate errors.
    * @param {*} username
    * @param {*} accountNumber assign a specific account number, else randomly generate it (optional)
    * @returns 
    */
    function (reqID) {
        // Import DB
        const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`)) 
        const Accounts = JSON.parse(fs.readFileSync(`./localDB/accounts.json`))
        const Requests = JSON.parse(fs.readFileSync(`./localDB/requests.json`))

        const username = Requests.account[reqID]?.username;
        const accountNumber = Requests.account[reqID]?.accNumber;
   
        // Ensure user exists
        if (Users[username] == undefined) {
            throw new Error(`Username ${username} is not registered`);
        }

        // Ensure user has more than one account
        if (Users[username].accountIDs.length < 2) {
            throw new Error("User must have at least one account left open.")
        }

        // Transfer cards and balance to another account
        if (Accounts[accountNumber].balance > 0 || Accounts[accountNumber].cards.length > 0) {
            // Iterate over user's accounts until valid one is found
            for (let curr of Users[username].accountIDs) {
                if (curr == accountNumber) continue;

                Accounts[curr].balance += Accounts[accountNumber].balance;
                Accounts[curr].cards.push(...Accounts[accountNumber].cards);
            }
        }

        delete Accounts[accountNumber];

        fs.writeFile(`./localDB/accounts.json`, JSON.stringify(Accounts), 'utf8', (err) => {
            if (err) {
                console.log(err);
                throw new Error('Failed to save DB')
            } else {
                console.log(`Banker closed account ${accountNumber}`)
            }
        })
   }