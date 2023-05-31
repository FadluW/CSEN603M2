const fs = require('fs');

module.exports = 
    /**
    * Add a new user to the file system database.
    * Throws apropriate errors.
    * @param {*} username 
    * @param {*} password 
    * @param {*} data additional user information such as
    * userType: Client/Banker, defaults to Client
    * natID: Client's national ID
    * @returns 
    */
    function (username, password, data = {}) {
        // Import DB
        const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`))     
   
        // Ensure no empty field
        if (!username || !password) {
           throw new Error('Please enter both the username and password.');
        }

        userType = data.userType ?? "client";
        if (userType == "client" && data.natID == undefined) {
            throw new Error('Please enter your national ID.')
        }
   
        // User already exists
        if (Users[username]) {
            throw new Error(`Username ${username} already taken!`);
        }
   
        // Add user to DB
        Users[username] = {
           password: password,
           createdOn: Date.now(),
           type: userType,
           notifs: []
        }
        // If client check if already owns accounts
        if (userType == "client") {
            Users[username].natID = data.natID;
            const Accounts = JSON.parse(fs.readFileSync(`./localDB/accounts.json`))     

            for (const curr in Accounts) {
                if (Accounts[curr].natID == data.natID) {
                    if (Users[username]?.accountIDs == undefined) {
                        Users[username].accountIDs = [curr];
                    } else {
                        Users[username].accountIDs.push(curr);
                    }
                }
            }
        }

        fs.writeFile(`./localDB/users.json`, JSON.stringify(Users), 'utf8', (err) => {
            if (err) {
                console.log(err);
                throw new Error('Failed to save DB')
            } else {
                console.log(`Registered user: ${username}`)
            }
        })
   
       return
   }