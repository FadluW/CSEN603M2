const fs = require('fs');

module.exports = 
    /**
    * Add a new account linked to a user to the file system database.
    * Throws apropriate errors.
    * @param {*} username 
    * @param {*} currency
    * @param {*} accountNumber assign a specific account number, else randomly generate it (optional)
    * @returns 
    */
    function (username, currency, accountNumber = "") {
        // Import DB
        const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`)) 
        const Accounts = JSON.parse(fs.readFileSync(`./localDB/accounts.json`))
   
        // Ensure user exists
        if (Users[username] == undefined) {
            throw new Error(`Username ${username} is not registered`);
        }

        // Randomly generate account number if not given, check if it exists if given
        if (accountNumber == "") {
            // TODO: random gen
        } else if (Accounts[accountNumber] != undefined) {
            throw new Error(`Account with this number already exists`)
        }

        // Add account to accounts database
        Accounts[accountNumber] = {
            balance: 0,
            currency: currency,
            cards: []
        }
        fs.writeFile(`./localDB/accounts.json`, JSON.stringify(Accounts), 'utf8', (err) => {
            if (err) {
                console.log(err);
                throw new Error('Failed to save DB')
            } else {
                console.log(`Registered account ${accountNumber}`)
            }
        })

        // Add account to user
        if (Users[username]?.accountIDs == undefined) {
            Users[username].accountIDs = [accountNumber];
        } else {
            Users[username].accountIDs.push(accountNumber);
        }
        fs.writeFile(`./localDB/users.json`, JSON.stringify(Users), 'utf8', (err) => {
            if (err) {
                console.log(err);
                throw new Error('Failed to save DB')
            } else {
                console.log(`Linked account ${accountNumber} to ${username}`)
            }
        })
    
        return
   }