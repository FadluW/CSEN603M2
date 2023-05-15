const fs = require('fs')

module.exports = 
    /**
    * Fetch Client/Banker using given credentials
    * Throws apropriate errors.
    * @param {*} username 
    * @param {*} password 
    * @returns User object with necessary data
    */
    function (username, password) {
        const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`))

        // Ensure no empty field
        if (!username || !password) {
            throw new Error('Please enter both the username and password.');
        }
        // User does not exist
        if (!Users[username] || Users[username]?.password != password) {
            throw new Error('Incorrect username/password.');
        }

        // User info
        return {
            username: username,
            userType: Users[username].type
        }
    }