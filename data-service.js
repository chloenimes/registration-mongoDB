// **************************************************************************
// AS 5 - installing sequelize
// **************************************************************************
const { BelongsTo } = require('sequelize');
const Sequelize = require('sequelize');
var sequelize = new Sequelize('dekcflidff8bl9', 'scuzuzhdvambns', 'bb48e0b1a011c594914184e166ed011bf2e5a6e07108a623b373536f29afed8c', {
    host: 'ec2-54-161-189-150.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: {raw:true}
});

// **************************************************************************
// AS 5 - creating data models
// **************************************************************************
const Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    martialStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    hireDate: Sequelize.STRING
});

const Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
});

Department.hasMany(Employee, {foreignKey: 'department'});

// **************************************************************************
// AS 5 - update data-service.js
// **************************************************************************
// initialize
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        sequelize.sync()
        .then(resolve()) // success
        .catch(
            reject('unable to sync the database')
        );
    });
}

// getAllEmployees()
module.exports.getAllEmployees = function() {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            order: ['employeeNum']          //when updating, order by num
        })
        .then((data)=>{
            resolve(data);
        })
        .catch((err)=>{
            reject('no results returned');
        })
    });
}
// getDepartments()
module.exports.getDepartments = function() {
    return new Promise((resolve, reject) => {
        Department.findAll({
            order: ['departmentId']          //when updating, order by id
        })
        .then((data)=>{
            resolve(data);
        })
        .catch((err)=>{
            reject('no results returned');
        })
    });
}


// addEmployee() 
module.exports.addEmployee = function(employeeData) {   
    return new Promise((resolve, reject) => {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (let i in employeeData){
            if(employeeData[i] == "") {
                employeeData[i] = null;
            }
        }

        Employee.create({
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN : employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            department: employeeData.department,
            hireDate: employeeData.hireDate
        })
        .then(() => {
            resolve();
        })
        .catch((err)=>{
            reject('unable to add employee');
        })   
    });
}

// getEmployeesByStatus()
module.exports.getEmployeesByStatus = function(status) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where : {status: status}
        })
        .then((data)=>{
            resolve(data);
        })
        .catch((err)=>{            
            reject('no results returned');
        })
    });
}
// getEmployeesByDepartment() 
module.exports.getEmployeesByDepartment = function(department) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: {department:department}
        })
        .then((data)=>{
            resolve(data);
        })
        .catch((err)=>{
            reject('no results returned');
        })
    });
}
// getEmployeesByManager() 
module.exports.getEmployeesByManager = function(manager) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: {employeeManagerNum: manager}
        })
        .then((data)=>{
            resolve(data);
        })
        .catch((err)=>{
            reject('no results returned');
        })
    });
}
// getEmployeeByNum() 
module.exports.getEmployeeByNum = (num) => {    
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: {employeeNum: num}
        })
        .then((data)=>{
            resolve(data[0]);
        })
        .catch((err)=>{
            reject('no results returned');
        })
    });
}

module.exports.updateEmployee = function(employeeData) {
    return new Promise((resolve, reject) => {

        console.log('employee data in 187')
        console.log(employeeData)

        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (let i in employeeData){
            if(employeeData[i] == "") {
                employeeData[i] = null;
            }
        }
        
        Employee.update({
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            maritalStatus: employeeData.maritalStatus,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            department: employeeData.department,
            hireDate: employeeData.hireDate
        }, {
            where: {employeeNum: employeeData.employeeNum}
        })
        .then(()=>{
            resolve();
        })
        .catch((err)=>{
            reject('unable to update employee'); 
        })
    });
}


// addDepartment(departmentData)
module.exports.addDepartment = function(departmentData) {
    return new Promise((resolve, reject) => {
        for (let i in departmentData){
            if(departmentData[i] == "") {
                departmentData[i] = null;
            }
        }
        Department.create({
            departmentName: departmentData.departmentName
        })
        .then((data) => {
            resolve(data);
        }).catch(function (error) {
            reject("unable to create department"); 
        });      
    });
}
// updateDepartment(departmentData)
module.exports.updateDepartment = function(departmentData) {
    return new Promise((resolve, reject) => {
        for (let i in departmentData){
            if(departmentData[i] == "") {
                departmentData[i] = null;
            }
        }
        Department.update({
            departmentName: departmentData.departmentName
        }, {                
            where: {departmentId: departmentData.departmentId}
        })
        .then(()=>{            
            resolve();
        })
        .catch((err)=>{
            reject('unable to update department');
        })  
    });
}
// getDepartmentById(id)
module.exports.getDepartmentById = function(id) {
    return new Promise((resolve, reject) => {
        Department.findAll({
            where: {departmentId: id}
        })
        .then((data)=>{
            resolve(data);
        })
        .catch((err)=>{
            reject('no results returned');
        })
    });
}
// deleteDepartmentById(id)
module.exports.deleteDepartmentById = function(id) {
    return new Promise((resolve, reject) => {
        Department.destroy({
            where: {departmentId: id}
        })
        .then(()=>{
            resolve();
        })
        .catch((err)=>{
            reject('unable to delete department');
        })
    });
}

// **************************************************************************
// AS 5 - updating server.js, data-service.js & employees.hbs to Delete Employees
// **************************************************************************
// deleteEmployeeByNum(empNum)
module.exports.deleteEmployeeByNum = (num) => {
    return new Promise((resolve, reject) => {
        Employee.destroy({
            where: {employeeNum: num}
        }).then(() => {
            resolve();
        }).catch((err) => {
            reject('unable to delete employee');
        })
    });
}
