const fs = require('fs')

module.exports = 
    /**
    * Adds a new card transaction to the transaction relation
    * @param {*} username of the person trying to send money
    * @param {*} accountNum of the account to view
    * @returns Array of account objects belonging to given username
    */
    function (username, accountNum) {
        const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`))
        const Accounts = JSON.parse(fs.readFileSync(`./localDB/accounts.json`))

        let accountTransactions = [];
        let user = Users[username];
        let account = Accounts[accountNum];

        // Return if account doesn't exist
        if (account == undefined || account?.transIDs == undefined) {
            return accountTransactions;
        }

        // Return if user doesn't exist
        if (user == undefined || user?.accountIDs == undefined) {
            return accountTransactions;
        }

        // Ensure if user is client, they're accessing their own account only
        if (user.userType == "client" && !user.accountIDs.includes(accountNum)) {
            throw new Error("Not allowed to view this account")
        }

        // Iterate over user owned account IDs and fetch their info from the accounts database
        for (let transID of account?.transIDs) {
            // Skip account ID if not found in transactions database
            if (Transactions[transID] == undefined) continue;
            
            accountTransactions.push({
                ID: transID,
                from: Transactions[transID].from,
                to: Transactions[transID].to,
                amount: Transactions[transID].amount,
                date: Transactions[transID].date
            })
        }
        return accountTransactions;
    }