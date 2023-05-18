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
app.use(session({secret:'Secret Value', name: Date.now().toString(16), cookie: {maxAge: 60000}, resave: false, saveUninitialized:false}))

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

app.get('/dashboard', (req, res) => {
    // Ensure user logged in
    if (!req.session.loggedin) {
        return res.redirect('login')
    }

    // Dynamically change template based on user type
    let renderOptions = {layout: 'clientDash', username: req.session.username};
    switch (req.session.userType) {
        case "client": {
            renderOptions.layout = 'clientDash'
            renderOptions.accountsArr = functions.getAccounts(req.session.username)
            break;
        }
        case "banker": {
            renderOptions.layout = 'bankerDash'
            break;
        }
        case "admin": {
            renderOptions.layout = 'adminDash'
            return res.render('dashboardAdmin', renderOptions);
            break;
        }
        default: {

        }
    }
    
    res.render('dashboard', renderOptions)
})

app.get('/accounts/:username', (req, res) => {
    // Ensure user logged in
    if (!req.session.loggedin) {
        return res.redirect('/login')
    }
    // Dynamically change template based on user type
    let renderOptions = {accountsArr: functions.getAccounts(req.params.username)};
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

// Render other pages
app.get('/:path', (req, res) => {
    // Ensure user logged in
    if (req.params.path != "registration" && !req.session.loggedin) {
        return res.redirect('login')
    }
    if (req.params.path == "favicon.ico") return res.end();
    res.render(req.params.path);
})

// Post methods for all pages
app.post('/:path', (req, res) => {
    // Switch on all cases of path of post
    switch(req.params.path) {
        case "register": {
            try {
                functions.addUser(req.body?.username, req.body?.password);
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

            return res.redirect('/dashboard');
        }
        case "adminAddAccount": {
            try {
                functions.addAccount(req.body?.username, 'EGP', req.body?.accID)
            } catch (error) {
                return res.send(error.message)
            }

            // TODO: make better redirect
            return res.redirect('/dashboard')
        }
        case "adminViewAccounts": {
            return res.redirect(`/accounts/${req.body.accUsername}`)
        }
        default: {
            return res.send(`Error trying to POST ${req.params.path}`);
        }
    }
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
