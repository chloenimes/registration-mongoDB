/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Chloe Jung      Student ID: 109723205       Date: 2021-12-02
*
*  Online (Heroku) Link: https://stormy-tor-42192.herokuapp.com/
*
********************************************************************************/ 
const dataService = require('./data-service.js');
const clientSessions = require('client-sessions');
// AS 6 dataServiceAuth
const dataServiceAuth = require('./data-service-auth.js');
var path = require('path');
var express = require('express');
var app = express();
// **************************************************************************
// AS 3
// **************************************************************************
// multer
const multer = require('multer');
// file system Part2 - step3
const fs = require('fs');
const { urlencoded } = require('express');
const { get } = require('http');
// **************************************************************************
// AS 4 Part1 Step1
// **************************************************************************
// express-handlebars
const exphbs = require('express-handlebars');
const { resourceUsage } = require('process');
// express-handlebars v.6.0.1 exphbs.engine()
app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    defaultLayout: 'main',
    // handlebars custom helper AS4 Part1 Step4
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }        
    }
}));
app.set('view engine', '.hbs');
// **************************************************************************

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
    console.log("Express http server listening on: "+ HTTP_PORT);
}

// **************************************************************************
// AS 3
// **************************************************************************
// multer diskStorage Part2 - step1
const storage = multer.diskStorage({
    destination: './public/images/uploaded',
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({storage: storage});

// adding built-in 'express.urlencoded' middleware Part3 - step1
app.use(express.urlencoded({extended:true}));

// **************************************************************************
// AS 4 Part1 - Step4
// **************************************************************************
// middleware to add 'activeRoute' to 'app.locals'
app.use(function(req,res,next) {
    let route = req.baseUrl+req.path;
    app.locals.activeRoute = (route == "/") ? "/":route.replace(/\/$/,"");
    next();
});
// **************************************************************************
// AS 6 -client-sessions middleware
// **************************************************************************
app.use(clientSessions( {
    cookieName: "session",
    secret: "web_as6_secret",
    duration: 2*60*1000,
    activeDuration: 1000*60
}));

app.use((req,res,next) => {
    res.locals.session = req.session;
    next();
});

// helper middleware function
ensureLogin = (req,res,next) => {
    if (!(req.session.user)) {
        res.redirect("/login");
    }
    else { next(); }
};

// **************************************************************************
// change GET route to render home view AS4 Part1 - step2
app.get('/', function(req, res){
    res.render('home');
});
app.get('/home', function(req, res){
    res.render('home');
});

// static middleware for /css/site.css
app.use(express.static(path.join(__dirname, '/public')));
// change GET route to render AS4 Part1 - step3
app.get('/about', function(req, res){
    res.render('about');
});

// AS6 -update all routes below with 'ensureLogin'
// images
// change GET route to render AS4 Part1 - step3
app.get('/images/add', ensureLogin, function(req, res){
    res.render(path.join(__dirname,'/views/addImage.hbs'));
});
// adding the POST route AS3 Part2 - step2
app.post('/images/add', ensureLogin, upload.single('imageFile'), (req, res) =>{
    res.redirect('/images');
});
// Modify GET route AS4 Part2 - Step1
app.get('/images', ensureLogin, function(req, res){
    fs.readdir('./public/images/uploaded', (err, imageFile) =>{
        res.render('images', {data: imageFile});
    });
});

// **************************************************************************
// AS 3- Part4 - step1 - update the '/employees' route
// **************************************************************************
// AS 4- Part3 - step1 - modify to res.render()
// **************************************************************************
app.get('/employees', ensureLogin, (req, res) => {
    if(req.query.status) {
        dataService.getEmployeesByStatus(req.query.status)
        .then((data) => {
            if(data.length > 0) {
                res.render('employees', {employees: data});
            }
            else {
                res.render('employees', {message: 'no results'});
            }
        }).catch((err) => {
            res.render('employees', {message: 'no results'});
        });
    }
    else if (req.query.department) {
        dataService.getEmployeesByDepartment(req.query.department)
        .then((data) => {
            if(data.length > 0) {
                res.render('employees', {employees: data});
            }
            else {
                res.render('employees', {message: 'no results'});
            }
        }).catch((err) => {
            res.render('employees', {message: 'no results'});
        });
    }
    else if (req.query.manager) {
        dataService.getEmployeesByManager(req.query.manager)
        .then((data) => {
            if(data.length > 0) {
                res.render('employees', {employees: data});
            }
            else {
                res.render('employees', {message: 'no results'});
            }
        }).catch((err) => {
            res.render('employees', {message: 'no results'});
        });
    }
    else {
        dataService.getAllEmployees()
        .then((data) => {
            if(data.length > 0) {
                res.render('employees', {employees: data});
            }
            else {
                res.render('employees', {message: 'no results'});
            }       
        }).catch((err) => {
            res.render('employees', {message: 'no results'});
        });
    }
});
// ERROR: no connected with the page
// FIXED: by adding routes, the page works 
// Rubric Detail feedback: *Add Employee Page?
app.get('/employees/add', ensureLogin, (req,res) => {
    //res.render(path.join(__dirname + "/views/addEmployee.hbs"));
    dataService.getDepartments()
    .then((data) => {
        res.render('addEmployee', {departments: data}
    )})
    .catch((err) => {
        res.render('addEmployee', {departments: []}
    )});
});
app.post('/employees/add', ensureLogin, (req,res) => {
    dataService.addEmployee(req.body)
    .then(() => {
        res.redirect("/employees");
    })
    .catch((err) => {
        res.status(500).send("Unable to Add Employee");
    })
});

// **************************************************************************
// AS 5- updating the "Department" List in the Employee Views
// **************************************************************************
app.get("/employee/:empNum", ensureLogin, (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};

    dataService.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error
 
    }).then(dataService.getDepartments)
    .then((data) => {
        viewData.departments = data; // store department data in the "viewData" object as "departments"

        // loop through viewData.departments and once we have found the departmentId that matches
        // the employee's "department" value, add a "selected" property to the matching 
        // viewData.departments object

        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.employee.department) {
                viewData.departments[i].selected = true;
            }
        }

    }).catch(() => {
        viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
        if (viewData.employee == null) { // if no employee - return an error
            res.status(404).send("Employee Not Found");
        } else {
            res.render("employee", { viewData: viewData }); // render the "employee" view
        }
    });
});

// **************************************************************************
// AS 4- Part5 - Step1 & Step2
// **************************************************************************
// add POST route '/employee/update'
app.post('/employee/update', ensureLogin, (req, res) => {
    dataService.updateEmployee(req.body)
    .then(() => {
        res.redirect('/employees');
    })
    .catch((err) => {
        res.status(500).send("Unable to Update Employee");
    })
});


// **************************************************************************
// AS 5- updating routes to add/update Departments
// **************************************************************************
// departments
app.get('/departments', ensureLogin, (req, res) => {
    dataService.getDepartments()
    .then((data) => {        
        if(data.length > 0){
            res.render('departments', {departments : data}); 
        }
        else {
            res.render('departments', {message: 'no results'}); 
        }
    }).catch((err) => {
        res.render('departments', {message: 'no results'});
    });
});

// departments/add
app.get('/departments/add', ensureLogin, (req, res) => {
    //res.render(path.join(__dirname, '/views/addDepartment.hbs'));
    res.render('addDepartment');
})
app.post('/departments/add', ensureLogin, (req, res) => {
    dataService.addDepartment(req.body)
    .then(() => {
        res.redirect('/departments');
    })
    .catch((err) => {
        res.status(500).send("Unable to Add Department");
    })
})

// department/update
app.post('/department/update', ensureLogin, (req,res) => {
    dataService.updateDepartment(req.body)
    .then(() => {
        res.redirect('/departments');
    })
    .catch((err) => {
        res.status(500).send("Unable to Update Department");
    })
});

// department/:departmentId
app.get("/department/:departmentId", ensureLogin, (req, res) => {
    dataService.getDepartmentById(req.params.departmentId)
    .then((data) => {
        res.render("department", { department: data });
    })
    .catch((err) =>{
        res.status(404).send("Department Not Found")
    })
});

// departments/delete/:departmentId
app.get('/departments/delete/:departmentId', ensureLogin, (req, res) => {
    dataService.deleteDepartmentById(req.params.departmentId)
    .then(() => {
        res.redirect('/departments');
    })
    .catch((err) => {
        res.status(500).send('Unable to Remove Department / Department not found');
    })
})

// **************************************************************************
// AS 5 - updating server.js, data-service.js & employees.hbs to Delete Employees
// **************************************************************************
// employees/delete/:empNum
app.get('/employees/delete/:empNum', ensureLogin, (req, res) => {
    dataService.deleteEmployeeByNum(req.params.empNum)
    .then(() => {
        res.redirect('/employees');
    })
    .catch((err) => {
        res.status(500).send('Unable to Remove Employee / Employee not found');
    })
})

// **************************************************************************
// AS 6- adding new routes
// **************************************************************************
// login
app.get('/login', (req, res)=>{
    res.render('login');
})
app.get('/register', (req, res)=>{
    res.render('register');
})
app.post('/register', (req, res)=>{
    dataServiceAuth.registerUser(req.body)
    .then(()=>{
        res.render('register', {successMessage: 'User created'});
    })
    .catch((err)=>{
        res.render('register', {errorMessage: err, userName:req.body.userName});
    })
})
app.post('/login', (req, res)=>{
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body)
    .then((user)=>{
        req.session.user = {
            userName:user.userName,
            email:user.email,
            loginHistory:user.loginHistory
        }
        res.redirect('/employees');
    })
    .catch((err)=>{
        res.render('login', {errorMessage:err, userName:req.body.userName});
    })
})
// logout
app.get('/logout', (req, res)=>{
    req.session.reset();
    res.redirect('/');
}) 
app.get('/userHistory', ensureLogin, (req, res)=>{
    res.render('userHistory', {user:req.session.user});
})










// no matching route
app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

// setup http server
//app.listen(HTTP_PORT, onHttpStart);
//updating the code surrounding app.listen()
// dataService.initialize()
// .then(()=>{
//     app.listen(HTTP_PORT, onHttpStart());
// })
// .catch(() => {
//     console.log('error occurred')
// })
// **************************************************************************
// AS 6 - adding dataServiceAuth.initialize to startup procedure
// **************************************************************************
dataService.initialize()
.then(dataServiceAuth.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});
