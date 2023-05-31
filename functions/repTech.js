const fs = require('fs')

module.exports = 
    /**
    * Freeze Card and submit request
    * @param {*} username
    * @param {*} category
    * @param {*} repMsg optional message sent in by user 
    * @returns Array of account objects belonging to given username
    */
    function (username, category, repMsg = "Nothing") {
        const RepIssues = JSON.parse(fs.readFileSync(`./localDB/reportedIssues.json`))

        let randReqID = Date.now().toString(16);
        RepIssues[randReqID] = {
            username: username,
            category: category,
            repMsg: repMsg,
            createdOn: Date.now()
        }

        fs.writeFile(`./localDB/reportedIssues.json`, JSON.stringify(RepIssues), 'utf8', (err) => {
            if (err) {
                console.log(err);
                throw new Error('Failed to save DB')
            }
        })
    }