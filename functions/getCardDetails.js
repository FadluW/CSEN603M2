const fs = require('fs')

module.exports = 
    /**
    * Fetch Client card transactions.
    * @param {*} username of the person trying to access
    * @param {*} cardNum of the account to view
    * @returns Array of card transactions belonging to given username
    */
    function (username, cardNum) {
        const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`))
        const Accounts = JSON.parse(fs.readFileSync(`./localDB/accounts.json`))
        const Cards = JSON.parse(fs.readFileSync(`./localDB/cards.json`))
        const Transactions = JSON.parse(fs.readFileSync(`./localDB/cardTransactions.json`))

        let cardTransactions = [];
        let user = Users[username];
        let card = Cards[cardNum];
        let account;

        // Return if user doesn't exist
        if (user == undefined || user?.accountIDs == undefined) {
            return {
                transactions: cardTransactions,
                points: card?.points ?? 0
            } 
        }

        for (let accountID of user.accountIDs) {
            if (Accounts[accountID].cards.includes(cardNum)) {
                account = Accounts[accountID];
                break;
            }
        }

        // Return if account/card doesn't exist
        if (account == undefined || account?.transIDs == undefined) {
            return {
                transactions: cardTransactions,
                points: card?.points ?? 0
            } 
        }
        if (card == undefined || card?.transIDs == undefined) {
            return {
                transactions: cardTransactions,
                points: card?.points ?? 0
            } 
        }


        // Ensure if user is client, they're accessing their own account only
        if (user.userType == "client" && (!user.accountIDs.includes(accountNum) || !account.cards.includes(cardNum))) {
            throw new Error("Not allowed to view this account")
        }

        // Iterate over user owned account IDs and fetch their info from the accounts database
        for (let transID of card?.transIDs) {
            // Skip account ID if not found in transactions database
            if (Transactions[transID] == undefined) continue;
            cardTransactions.push({
                ID: transID,
                type: Transactions[transID].type,
                from: Transactions[transID].from,
                to: Transactions[transID].to,
                amount: `${((Transactions[transID].from == cardNum) ? "-":"" )} ${Transactions[transID].amount}`,
                date: new Date(Transactions[transID].date).toString(),
                details: Transactions[transID].details
            })
        }
        return {
            transactions: cardTransactions,
            points: card?.points ?? 0
        } 
    }