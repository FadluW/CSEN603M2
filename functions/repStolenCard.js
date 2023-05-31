const fs = require('fs')

module.exports = 
    /**
    * Freeze Card and submit request
    * @param {*} cardID 
    * @param {*} repMsg optional message sent in by user 
    * @returns Array of account objects belonging to given username
    */
    function (cardID, repMsg = "") {
        const Cards = JSON.parse(fs.readFileSync(`./localDB/cards.json`))
        const CardReqs = JSON.parse(fs.readFileSync(`./localDB/cardStolenRequests.json`))

        if (Cards[cardID] == undefined) {
            console.log(`Invalid Card ID reported stolen ${cardID}`)
            return;
        }

        Cards[cardID].frozen = true;
        fs.writeFile(`./localDB/cards.json`, JSON.stringify(Cards), 'utf8', (err) => {
            if (err) {
                console.log(err);
                throw new Error('Failed to save DB')
            } else {
                console.log(`Frozen Card: ${cardID}`)
            }
        })

        if (CardReqs[cardID] != undefined) {
            console.log(`Card ${cardID} already reported stolen`)
            return;
        }

        CardReqs[cardID] = {
            message: repMsg,
            reportedOn: Date.now(),
            resolved: false
        }
        fs.writeFile(`./localDB/cardStolenRequests.json`, JSON.stringify(CardReqs), 'utf8', (err) => {
            if (err) {
                console.log(err);
                throw new Error('Failed to save DB')
            } else {
                console.log(`Reported Stolen Card: ${cardID}`)
            }
        })
    }