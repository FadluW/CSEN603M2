const fs = require('fs')

module.exports = 
    /**
    * Fetch Client account details.
    * @param {*} username 
    * @returns Array of account objects belonging to given username
    */
    function (username) {
        const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`))
        const Accounts = JSON.parse(fs.readFileSync(`./localDB/accounts.json`))

        let userAccounts = [];
        let user = Users[username];

        // Return if user doesn't exist
        if (user == undefined || user?.accountIDs == undefined) {
            return userAccounts;
        }
        // Iterate over user owned account IDs and fetch their info from the accounts database
        for (let accountID of user?.accountIDs) {
            // Skip account ID if not found in accounts database
            if (Accounts[accountID] == undefined) continue;
            
            userAccounts.push({
                ID: accountID,
                balance: Accounts[accountID].balance,
            })
        }

        return userAccounts;
    }