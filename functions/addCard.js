const fs = require('fs');

module.exports = 
    /**
    * Add a new card to account
    * @param {*} accountNumber account to grant a card
    * @returns 
    */
    function (accountNumber) {
        // Import DB
        const Accounts = JSON.parse(fs.readFileSync(`./localDB/accounts.json`))
        const Cards = JSON.parse(fs.readFileSync(`./localDB/cards.json`))

        let cardNum = `52140042${Date.now().toString().substring(5, 13)}`
        let card = {
            balance: 0,
            cvv: 000,
            frozen: false,
            transIDs: []
        }

        // Add account to accounts database
        Accounts[accountNumber].cards.push(cardNum)
        Cards[cardNum] = card;

        fs.writeFile(`./localDB/accounts.json`, JSON.stringify(Accounts), 'utf8', (err) => {
            if (err) {
                console.log(err);
                throw new Error('Failed to save DB')
            }
        })
        fs.writeFile(`./localDB/cards.json`, JSON.stringify(Cards), 'utf8', (err) => {
            if (err) {
                console.log(err);
                throw new Error('Failed to save DB')
            }
        })
    
        return
   }