const express = require('express')
const fs = require('fs')
const session = require('express-session');
const handlebars = require('express-handlebars');
const functions = require('./functions');
var bodyParser = require('body-parser');

const app = express()
const port = process.env.PORT ?? 3000;

//Sets our app to use the handlebars engine
app.set('view engine', 'hbs');

//Sets handlebars configurations
app.engine('hbs', handlebars.engine({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs',
    defaultLayout: 'default',
    partialsDir: __dirname + '/views/partials/'
}));

app.use(express.static('public'))

// Support req.body for post requests
app.use(bodyParser.json());       
app.use(bodyParser.urlencoded({extended: true})); 

// Create sessions for user logins
app.use(session({secret:'Secret Value', name: Date.now().toString(16), cookie: {maxAge: 360000}, resave: false, saveUninitialized:false}))

// Redirect to main page
app.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.redirect(`/dashboard`)
    } else {
        res.redirect(`/login`);
    }

})
app.get('/login', (req, res) => {
    res.render('login');
})
app.get('/logout', (req, res) => {
    req.session.destroy();
    return res.redirect('/login');
})

app.get('/dashboard', (req, res) => {
    // Ensure user logged in
    if (!req.session.loggedin) {
        return res.redirect('login')
    }

    const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`)) 

    // Dynamically change template based on user type
    let renderOptions = {username: req.session.username, notifs: Users[req.session.username]?.notifs, errorArr: req.session.errorMsg, successArr: req.session.successMsg};
    req.session.errorMsg = [];
    req.session.successMsg = [];
    
    switch (req.session.userType) {
        case "client": {
            renderOptions.layout = 'clientDash'
            renderOptions.accountsArr = functions.getAccounts(req.session.username)
            renderOptions.cardsArr = functions.getCards(req.session.username)
            return res.render('dashboardClient', renderOptions);
        }
        case "banker": {
            

            renderOptions.layout = 'bankerDash'
            let requests = functions.getRequests();
            renderOptions.accountOpenArr = requests.accountOpen;
            renderOptions.accountCloseArr = requests.accountClose;
            renderOptions.loanArr = requests.loan;
            renderOptions.cardArr = requests.card;
            renderOptions.cardStolenArr = JSON.parse(fs.readFileSync(`./localDB/cardStolenRequests.json`));

            return res.render('dashboardBanker', renderOptions);
        }
        case "admin": {
            renderOptions.layout = 'adminDash'
            return res.render('dashboardAdmin', renderOptions);
        }
        default: {

        }
    }
    
    res.render('dashboard', renderOptions)
})

app.get('/accountManage', (req, res) => {
    // Ensure user logged in
    if (!req.session.loggedin) {
        return res.redirect('/login')
    }
    // Dynamically change template based on user type
    let renderOptions = {errorArr: req.session.errorMsg, successArr: req.session.successMsg};
    req.session.errorMsg = [];
    req.session.successMsg = [];

    switch (req.session.userType) {
        case "client": {
            renderOptions.accountsArr = functions.getAccounts(req.session.username)
            renderOptions.layout = 'clientDash'
            return res.render('accountManage', renderOptions)
        }
        case "banker": {
            renderOptions.layout = 'bankerDash'
            break;
        }
        case "admin": {
            return res.redirect('/dashboard')
        }
        default: {

        }
    }
})

app.get('/accounts', (req, res) => {
    // Ensure user logged in
    if (!req.session.loggedin) {
        return res.redirect('/login')
    }
    // Dynamically change template based on user type
    let renderOptions = {accountsArr: functions.getAccounts(req.query?.user), errorArr: req.session.errorMsg, successArr: req.session.successMsg};
    req.session.errorMsg = [];
    req.session.successMsg = [];
    
    // If no user passed, go back to dashboard
    if (req.query?.user == undefined) {
        return res.redirect('/dashboard')
    }

    switch (req.session.userType) {
        case "client": {
            return res.redirect('dashboard')
        }
        case "banker": {
            renderOptions.layout = 'bankerDash'
            break;
        }
        case "admin": {
            renderOptions.layout = 'adminDash'
            break;
        }
        default: {

        }
    }

    res.render('accounts', renderOptions)
})


app.get(`/cardDetails`, (req, res) => {
    // Ensure user logged in
    if (!req.session.loggedin) {
        return res.redirect('/login')
    }

    let cardObj = functions.getCardDetails(req.session.username, req.query.card);
    
    // Dynamically change template based on user type
    let renderOptions = {cardID: req.query.card, cardPoints: cardObj.points, cardPay: -cardObj.balance, disablePay: (cardObj.frozen || cardObj.balance == 0), cardArr: cardObj.transactions, noTrans: (cardObj.transactions.length < 1), errorArr: req.session.errorMsg, successArr: req.session.successMsg};
    req.session.errorMsg = [];
    req.session.successMsg = [];
    // accountsArr.sort()
    switch (req.session.userType) {
        case "client": {
            renderOptions.layout = 'clientDash'
            break;
        }
        case "banker": {
            renderOptions.layout = 'bankerDash'
            break;
        }
        case "admin": {
            renderOptions.layout = 'adminDash'
            break;
        }
        default: {

        }
    }

    res.render('cardDetails', renderOptions)
})

app.get(`/applyCard`, (req, res) => {
    // Ensure user logged in
    if (!req.session.loggedin) {
        return res.redirect('/login')
    }

    let renderOptions = {username: req.session.username, errorArr: req.session.errorMsg, successArr: req.session.successMsg};
    req.session.errorMsg = [];
    req.session.successMsg = [];

    switch (req.session.userType) {
        case "client": {
            renderOptions.layout = 'clientDash'
            renderOptions.accountsArr = functions.getAccounts(req.session.username)
            return res.render('applyCard', renderOptions);
        }
        case "banker": {
            return res.redirect('/dashboard')
        }
        case "admin": {
            return res.redirect('/dashboard')
        }
        default: {

        }
    }
})

app.get(`/accountDetails`, (req, res) => {
    // Ensure user logged in
    if (!req.session.loggedin) {
        return res.redirect('/login')
    }

    // Dynamically change template based on user type
    let accountsArr = functions.getAccountDetails(req.session.username, req.query.account);
    
    let renderOptions = {accountsArr, noTrans: (accountsArr.length < 1), errorArr: req.session.errorMsg, successArr: req.session.successMsg};
    req.session.errorMsg = [];
    req.session.successMsg = [];
    // accountsArr.sort()
    switch (req.session.userType) {
        case "client": {
            renderOptions.layout = 'clientDash'
            break;
        }
        case "banker": {
            renderOptions.layout = 'bankerDash'
            break;
        }
        case "admin": {
            renderOptions.layout = 'adminDash'
            break;
        }
        default: {

        }
    }

    res.render('accountDetails', renderOptions)
})

app.get(`/transfer`, (req, res) => {
    // Ensure user logged in
    if (!req.session.loggedin) {
        return res.redirect('/login')
    }
    // Dynamically change template based on user type
    let renderOptions = {accountsArr: functions.getAccounts(req.session.username), errorArr: req.session.errorMsg, successArr: req.session.successMsg};
    req.session.errorMsg = [];
    req.session.successMsg = [];
    
    switch (req.session.userType) {
        case "client": {
            renderOptions.layout = 'clientDash'
            break;
        }
        case "banker":
        case "admin": {
            return res.redirect('dashboard')
        }
        default: {

        }
    }

    res.render('transfer', renderOptions)
})

app.get(`/resolveTech`, (req, res) => {
    // Ensure user logged in
    if (!req.session.loggedin) {
        return res.redirect('/login')
    }

    let renderOptions = {username: req.session.username, errorArr: req.session.errorMsg, successArr: req.session.successMsg};
    req.session.errorMsg = [];
    req.session.successMsg = [];

    switch (req.session.userType) {
        case "client": {
            return res.redirect('/dashboard')
        }
        case "banker": {
            return res.redirect('/dashboard')
        }
        case "admin": {
            renderOptions.layout = 'adminDash'
            renderOptions.issuesArr = JSON.parse(fs.readFileSync(`./localDB/reportedIssues.json`))
            return res.render('resolveTech', renderOptions);
        }
        default: {

        }
    }
})

// Render other pages
app.get('/:path', (req, res) => {
    // Ensure user logged in
    if (req.params.path != "registration" && !req.session.loggedin) {
        return res.redirect('login')
    }
    if (req.params.path == "favicon.ico") return res.end();

    // Dynamically change template based on user type
    let renderOptions = {username: req.session.username, accountsArr: functions.getAccounts(req.session.username),errorArr: req.session.errorMsg, successArr: req.session.successMsg};
    req.session.errorMsg = [];
    req.session.successMsg = [];
    
    switch (req.session.userType) {
        case "client": {
            renderOptions.layout = 'clientDash'
            break;
        }
        case "banker": {
            renderOptions.layout = 'bankerDash'
            break;
        }
        case "admin": {
            renderOptions.layout = 'adminDash'
            break;
        }
        default: {

        }
    }

    res.render(req.params.path, renderOptions);
})

// Post methods for all pages
app.post('/:path', (req, res) => {
    // Switch on all cases of path of post
    switch(req.params.path) {
        case "register": {
            try {
                functions.addUser(req.body?.username, req.body?.password, {natID: req.body?.natID});
            } catch (error) {
                return res.send(error.message)
            }

            return res.redirect('/login');
        }
        case "login": {
            let userInfo;
            try {
                userInfo = functions.loginUser(req.body?.username, req.body?.password);
            } catch (error) {
                return res.send(error.message)
            }

            if (userInfo == undefined) {
                return res.send('Technical Error, Try again later.')
            }

            // Attach username and type to the session
            req.session.loggedin = true;
            req.session.username = userInfo.username;
            req.session.userType = userInfo.userType;
            req.session.errorMsg = [];
            req.session.successMsg = [];

            return res.redirect('/dashboard');
        }
        case "logout": {
            req.session.destroy();
            return res.redirect('/login');
        }
        case "reportCard": {
            functions.repStolenCard(req.session.username, req.body?.cardID, req.body?.repCardMsg);
            return res.redirect('/dashboard')
        }
        case "adminAddAccount": {
            try {
                functions.addAccount(req.body?.username, req.body?.accID)
            } catch (error) {
                return res.send(error.message)
            }

            // TODO: make better redirect
            return res.redirect('/dashboard')
        }
        case "adminViewAccounts": {
            return res.redirect(`/accounts?user=${req.body.accUsername}`)
        }
        case "openAccount": {
            // Function send request to account Requests DB
            try {
                functions.reqOpenAccount(req.session.username);
            } catch (error) {
                console.log(error.message)
            }

            req.session.successMsg.push("Sent request to open an account.")
            return res.redirect('/dashboard')
        }
        case "closeAccount": {
            // Function to handle closing account
            let closeAcc = req.body.closeAcc;
            try {
                functions.reqCloseAccount(req.session.username, closeAcc)
            } catch (error) {
                req.session.errorMsg.push(error.message);
                return res.redirect(`/accountManage`)
            }

            req.session.successMsg.push(`Request to close account ${closeAcc} sent. Balances will be updated shortly.`)
            return res.redirect('/dashboard')
        }
        case "reportTech": {
            try {
                functions.repTech(req.session.username, req.body.cat, req.body.desc);
            } catch (error) {
                console.log(error.message)
            }

            req.session.successMsg.push("Technical Issue Reported. Thank you.")
            return res.redirect('/dashboard')
        }
        case "sendAnnounce": {
            if (req.session.userType != "client") {
                // Send notif to all
                functions.broadcastNotif(`${req.body.title}: ${req.body.msg}`)

                req.session.successMsg.push("Announcement Sent!")
            }

            return res.redirect('/dashboard')
        }
        case "applyCard": {
            try {
                functions.reqAddCard(req.session.username, req.body.applyAcc);
            } catch (error) {
                console.log(error.message)
            }

            req.session.successMsg.push("Applied for credit card")
            return res.redirect('/dashboard')
        }
        case "addReminder": {
            // TODO: Add reminder
            let category = req.body.remCat;
            let amount = req.body.remAmount;
            let date = req.body.remDate;

            req.session.successMsg.push(`Added reminder for ${category}`)
            return res.redirect('/utilities')
        }
        case "payUtil": {
            let category = req.body.payCat;
            let accountNum = req.body.payAcc;
            let amount = req.body.payAmount;

            try {
                functions.addTransactionAccount(req.session.username, amount, accountNum, category, "domestic", `Utilities Payment for ${category}`)
            } catch (error) {
                req.session.errorMsg.push(error.message)
                return res.redirect('/utilities')
            }
            
            req.session.successMsg.push(`Paid ${category} using ${accountNum}`)
            return res.redirect('/utilities')
        }
        case "clearNotifs": {
            const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`)) 

            Users[req.session.username].notifs = [];

            fs.writeFile(`./localDB/users.json`, JSON.stringify(Users), 'utf8', (err) => {
                if (err) {
                    console.log(err);
                }
            })

            req.session.successMsg.push("Cleared Notifications")
            return res.redirect(`/dashboard`)
        }
        case "applyLoan": {
            //Create loan request
            const Requests = JSON.parse(fs.readFileSync(`./localDB/requests.json`))

            let randReqID = Date.now().toString(16);
            Requests.loan[randReqID] = {
                username: req.session.username,
                accNum: req.body.account,
                amount: req.body.amount,
                category: req.body.category,
                interest: req.body.interest,
                createdOn: Date.now()
            }
            
            fs.writeFile(`./localDB/requests.json`, JSON.stringify(Requests), 'utf8', (err) => {
                if (err) {
                    console.log(err);
                    throw new Error('Failed to save DB')
                }
            })

            
            req.session.successMsg.push(`Applied for loan`)
            return res.redirect(`/loan`)
        }
        default: {
            return res.send(`Error trying to POST ${req.params.path}`);
        }
    }
})

app.post(`/removeReq/:reqID/:reqType`, (req, res) => {
    functions.reqRemove(req.params.reqID, req.params.reqType);

    req.session.successMsg.push(`Removed request ${req.params.reqID}`)
    res.redirect(`/dashboard`)
})

app.post(`/redeemPoints/:cardID`, (req, res) => {
    req.session.successMsg.push(`Redeemed Card Points as Cashback!`)
    res.redirect(`/dashboard`)
})

app.post('/grantLoan/:accNum/:reqID/:amount', (req, res) => {
    // Actually add money
    const Accounts = JSON.parse(fs.readFileSync(`./localDB/accounts.json`))

    Accounts[req.params.accNum].balance += parseInt(req.params.amount)


    fs.writeFile(`./localDB/accounts.json`, JSON.stringify(Accounts), 'utf8', (err) => {
        if (err) {
            console.log(err);
            throw new Error('Failed to save DB')
        }
    })

    functions.reqRemove(req.params.reqID, "loan");

    req.session.successMsg.push(`Granted loan to account ${req.params.accNum}`)
    res.redirect(`/dashboard`)
})

app.post('/grantCard/:accNum/:reqID', (req, res) => {
    functions.addCard(req.params.accNum);

    functions.reqRemove(req.params.reqID, 'card')

    req.session.successMsg.push(`Granted ${req.params.accNum} a card`)
    res.redirect(`/dashboard`)
})

app.post(`/openAccount/:username/:reqID`, (req, res) => {
    try {
        functions.addAccount(req.params.username);
    } catch (error) {
        req.session.errorMsg.push(error.message);
        return res.redirect(`/dashboard`)
    }

    // Remove request from DB after dealing with it
    try {
        functions.reqRemove(req.params.reqID, 'accountOpen');
    } catch (error) {
        console.log(error.message)
    }

    req.session.successMsg.push(`Opened account for ${req.params.username}`)
    res.redirect(`/dashboard`)
})

app.post(`/closeAccount/:reqID`, (req, res) => {
    try {
        functions.bankerCloseAccount(req.params.reqID)
    } catch (error) {
        req.session.errorMsg.push(error.message);
        return res.redirect(`/dashboard`)
    }

    // Remove request from DB after dealing with it
    try {
        functions.reqRemove(req.params.reqID, 'accountClose');
    } catch (error) {
        console.log(error.message)
    }

    req.session.successMsg.push(`Closed account request ${req.params.reqID}`)
    res.redirect(`/dashboard`)
})

app.post(`/transfer/account`, (req, res) => {
    // Call transaction function
    try {
        functions.addTransactionAccount(req.session.username, req.body.amount, req.body.sendingAcc, req.body.recieveAcc, req.body.transType, req.body.details)
    } catch (error) {
        req.session.errorMsg.push(error.message);
        return res.redirect('/transfer');
    }

    req.session.successMsg.push("Successfully transfered money!")
    res.redirect('/dashboard')
})

app.post(`/resolveIssue/:username/:reqID`, (req, res) => {
    // Remove report from DB
    const Issues = JSON.parse(fs.readFileSync(`./localDB/reportedIssues.json`)) 

    delete Issues[req.params.reqID];

    fs.writeFile(`./localDB/reportedIssues.json`, JSON.stringify(Issues), 'utf8', (err) => {
        if (err) {
            console.log(err);
        }
    })

    // Send notification to user
    functions.sendNotifs(req.params.username, `Technical Issue Resolved: ${req.params.reqID}. Thank you, ${req.params.username}`)

    req.session.successMsg.push("Removed issue and notified user who reported")
    res.redirect('/dashboard')
})

app.post(`/replaceCard/:username/:cardID`, (req, res) => {
    functions.sendNotifs(req.params.username, `Card Replacement: Request recieved. Replacement for ${req.params.cardID} arriving in 14-28 business days.`)
    
    req.session.successMsg.push(`Successfully Replaced Card ${req.params.cardID}`)
    return res.redirect(`/dashboard`)
})

app.post(`/payCard/:cardID`, (req, res) => {
    const Cards = JSON.parse(fs.readFileSync(`./localDB/cards.json`)) 

    if (Cards[req.params.cardID].frozen) {
        req.session.errorMsg.push(`Card is currently frozen. Please wait for its replacement.`)
        return res.redirect(`/dashboard`)
    }

    req.session.successMsg.push(`Successfully Paid ${req.body.payAmount} off Card ${req.params.cardID}`)
    return res.redirect(`/dashboard`)
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
