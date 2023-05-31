const fs = require('fs')

module.exports = 
    /**
    * Fetch Client account transactions.
    * @param {*} username of the person trying to access
    * @param {*} accountNum of the account to view
    * @returns Array of account objects belonging to given username
    */
    function (username, accountNum) {
        const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`))
        const Accounts = JSON.parse(fs.readFileSync(`./localDB/accounts.json`))
        const Transactions = JSON.parse(fs.readFileSync(`./localDB/accountTransactions.json`))

        let accountTransactions = [];
        let user = Users[username];
        let account = Accounts[accountNum];

        // Return if account doesn't exist
        if (account == undefined || account?.transIDs == undefined) {
            return accountTransactions;
        }

        // Return if user doesn't exist
        if (user == undefined) {
            return accountTransactions;
        }

        // Ensure if user is client, they're accessing their own account only
        if (user.userType == "client") {
            if (user?.accountIDs == undefined) {
                return accountTransactions
            }

            if (!user.accountIDs.includes(accountNum)){
                throw new Error("Not allowed to view this account")
            }
        }

        // Iterate over user owned account IDs and fetch their info from the accounts database
        for (let transID of account?.transIDs) {
            // Skip account ID if not found in transactions database
            if (Transactions[transID] == undefined) continue;
            accountTransactions.push({
                ID: transID,
                type: Transactions[transID].type,
                from: Transactions[transID].from,
                to: Transactions[transID].to,
                amount: `${((Transactions[transID].from == accountNum) ? "-":"" )} ${Transactions[transID].amount}`,
                date: new Date(Transactions[transID].date).toString(),
                details: Transactions[transID].details
            })
        }
        return accountTransactions;
    }