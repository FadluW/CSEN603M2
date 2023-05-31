const fs = require('fs')

module.exports = 
    /**
    * @returns array of all requests.
    */
    function () {
        const Requests = JSON.parse(fs.readFileSync(`./localDB/requests.json`))
        return Requests;
    }