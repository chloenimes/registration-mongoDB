// **************************************************************************
// AS 6 - for storing and retrieving user information
// **************************************************************************
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//all stored passwords are hashed
const bcrypt = require('bcryptjs');

var userSchema = new Schema({
    "userName": {
        "type":String,
        "unique":true
    },
    "password":String,
    "email":String,
    "loginHistory":[{
        "dateTime":Date,
        "userAgent":String
    }]
});
let User; //to be defined on new connection (see initialize)


// Exported Functions
module.exports.initialize = function() {
    return new Promise((resolve, reject) =>{
        const db = mongoose.createConnection("mongodb+srv://dbAdmin:Pa$$w0rd@senecaweb.v6kjj.mongodb.net/web322-as6?retryWrites=true&w=majority");
        db.on('error', (err)=>{
            reject(err);
        })
        db.once('open', ()=>{
            User = db.model('User', userSchema);
            resolve('connection successful')
        })
    })
}
module.exports.registerUser = function(userData) {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject('Passwords do not match');
        }
        else {
            // partB step2
            bcrypt.genSalt(10)
            .then((salt)=>{
                bcrypt.hash(userData.password, salt)
                .then((hash)=>{
                    userData.password = hash;
                    let newUser = new User(userData);
                    newUser.save((err)=>{
                        if(err) {
                            if (err.code == 11000) {
                                reject('User Name already taken');
                            }
                            else {
                                reject(`There was an error creating the user: ${err}`)
                            }
                        }
                        else {
                            resolve();
                        }
                    })                    
                })
                .catch((err)=>{
                    reject('There was an error encrypting the password');
                })
            })            
            .catch((err)=>{
                console.log(err);
            })
        }
    })
}
module.exports.checkUser = function(userData) {
    return new Promise((resolve, reject) => {
        User.find(
            {userName: userData.userName}
        ).exec()
        .then(users=>{
            bcrypt.compare(userData.password, users[0].password).then((result)=>{
                if (result === true) {
                    users[0].loginHistory.push({
                        dateTime: (new Date()).toString(),
                        userAgent: userData.userAgent
                    })
                    User.update(
    
                    ).exec()
                    .then(()=>{
                        resolve(users[0]);
                    })
                    .catch((err)=>{
                        reject(`There was an error verifying the user: ${err}`)
                    })
                }
                else {
                    reject(`Incorrect Password for use: ${userData.userName}`)
                }
            })
        })
        .catch(()=>{
            reject(`Unable to find user: ${userData.userName}`)
        })
    })
}