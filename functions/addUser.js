const fs = require('fs');

module.exports = 
    /**
    * Add a new user to the file system database.
    * Throws apropriate errors.
    * @param {*} username 
    * @param {*} password 
    * @param {*} userType Client/Banker, defaults to Client
    * @returns 
    */
    function (username, password, userType = 'client') {
       // Import DB
       const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`))     
   
       // Ensure no empty field
       if (!username || !password) {
           throw new Error('Please enter both the username and password.');
       }
   
       // User already exists
       if (Users[username]) {
           throw new Error(`Username ${username} already taken!`);
       }
   
       // Add user to DB
       Users[username] = {
           password: password,
           createdOn: Date.now(),
           type: userType
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