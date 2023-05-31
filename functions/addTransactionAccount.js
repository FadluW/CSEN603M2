const fs = require('fs')

module.exports = 
    /**
    * Adds a new account transaction to the transaction relation, as well as update the sending account and recieving if internal.
    * @param {*} username of the person trying to send money
    * @param {*} amount amount being sent
    * @param {*} accountNumSender of the sending account
    * @param {*} accountNumRecieve of the recieving account
    * @param {*} transactionType internal/domestic/international
    * @param {*} description details of this transaction
    * @returns boolean of success
    */
    function (username, amount, accountNumSender, accountNumRecieve, transactionType, description = "") {
        const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`))
        const Accounts = JSON.parse(fs.readFileSync(`./localDB/accounts.json`))
        const Transactions = JSON.parse(fs.readFileSync(`./localDB/accountTransactions.json`))

        let user = Users[username];
        let account = Accounts[accountNumSender];
        amount = parseInt(amount);

        // Return if account doesn't exist
        if (account == undefined) {
            throw new Error("Sending account does not exist.");
        }

        // Return if user doesn't exist
        if (user == undefined) {
            throw new Error(`User ${username} does not exist.`);
        }

        // Ensure if user is client, they're accessing their own account only
        if (user.userType == "client" && !user.accountIDs.includes(accountNumSender)) {
            throw new Error("Not allowed to make a transaction off this account")
        }

        // Ensure enough money on sending account
        if (account.balance < amount) {
            throw new Error("Insufficient Balance")
        }

        let randTransID = Date.now().toString(16);

        // Ensure if internal, recieving account exists
        if (transactionType == "internal") {
            if (Accounts[accountNumRecieve] == undefined) {
                throw new Error("Internal recieving account does not exist.")
            }

            if (Accounts[accountNumRecieve].transIDs == undefined) Accounts[accountNumRecieve].transIDs = [];

            Accounts[accountNumRecieve].transIDs.push(randTransID);
            Accounts[accountNumRecieve].balance += amount;
        }

        if (Accounts[accountNumSender].transIDs == undefined) Accounts[accountNumSender].transIDs = [];
        Accounts[accountNumSender].transIDs.push(randTransID);
        Accounts[accountNumSender].balance -= amount;

        Transactions[randTransID] = {
            from: accountNumSender,
            to: accountNumRecieve,
            type: transactionType,
            amount: amount,
            date: Date.now(),
            details: description
        }

        fs.writeFile(`./localDB/accountTransactions.json`, JSON.stringify(Transactions), 'utf8', (err) => {
            if (err) {
                console.log(err);
                throw new Error('Failed to save DB')
            } else {
                console.log(`Added Transaction ${randTransID} by ${username}`)
            }
        })

        fs.writeFile(`./localDB/accounts.json`, JSON.stringify(Accounts), 'utf8', (err) => {
            if (err) {
                console.log(err);
                throw new Error('Failed to save DB')
            }
        })
    }