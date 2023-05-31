const fs = require('fs');

module.exports = 
    /**
    * Remove Request from database
    * @param {*} reqID
    * @returns 
    */
    function (reqID, reqType) {
        // Import DB
        const Requests = JSON.parse(fs.readFileSync(`./localDB/requests.json`))
        
        delete Requests[reqType][reqID];

        fs.writeFile(`./localDB/requests.json`, JSON.stringify(Requests), 'utf8', (err) => {
            if (err) {
                throw new Error('Failed to save DB')
            }
        })
   }