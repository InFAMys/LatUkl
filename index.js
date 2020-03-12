const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')

const app = express()

const userKey= 'thisisveryseckretkey'
const adminKey = 'thisisverysecretkey'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ukl_latihan"
})

db.connect((err) => {
    if (err) throw err
    console.log("Database Connected!")
})

//========== JWT FOR USER ==========//
const userAuth = (request, result, next) => {
    if (typeof(request.headers['user-auth']) == 'undefined') {
        return result.status(403).json({
            success: false,
            message: 'Login First!'
        })
    }
    let token = request.headers['user-auth']
    jwt.verify(token, userKey, (err, decoded) => {
        if (err) {
            return result.status(401).json({
                success: false,
                message: 'Invalid Token'
            })
        }
    })

    next()
}

//========== GET ==========//
app.get('/', request, result) => {
    result.json({
        success: true,
        message: 'Welcome To Our Rental!, Please Login First!'
    })
}

//========== REGISTER ==========//
app.post('/register', (request, result) => {
    let data = request.body
    let sql = `
        insert into user (name, email, password)
        values ('`+data.name+`','`+data.email+`', '`+data.password+`');
    `
    db.query(sql, (err, result) =>{
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Successfully Registered!'
    })
})

//========== LOGIN USER ==========//
app.post('/login', function(request, result) {
    let data = request.body
      var email = data.email;
      var password = data.password;
      if (email && password) {
          db.query('select * from user where email = ? and password = ?', [email, password], function(error, results, fields) {
              if (results.length > 0) {
          let token = jwt.sign(data.email + '|' +data.password, userKey)
          result.json({
            success: true,
            message: 'Logged In',
            token: token
          });
              } else {
                  result.json({
            success: false,
            message: 'Invalid Credential!',
          });
              }
              result.end();
          });
      }
  });

  //========== CAR SECTION ==========//
  app.get('/car', userAuth, (req, res) => {
      let sql = `
        select * from car
      `
      db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            success: true,
            message: 'Success Retrieving All Car',
            data: result
            })
        })
  })

  app.get('/car/:id', userAuth, (req, res) => {
    let sql = `
      select * from car
      where id_car = '`+req.params.id+`'
      limit 1
    `
    db.query(sql, (err, result) => {
      if (err) throw err

      res.json({
          success: true,
          message: 'Success Getting Car From ID',
          data: result[0]
          })
      })
})



//==========********** ADMIN SECTION **********==========//
const adminAuth = (request, result, next) => {
    if (typeof(request.headers['admin-auth']) == 'undefined') {
        return result.status(403).json({
            success: false,
            message: 'Login First!'
        })
    }
    let token = request.headers['admin-auth']
    jwt.verify(token, adminKey, (err, decoded) => {
        if (err) {
            return result.status(401).json({
                success: false,
                message: 'Invalid Token'
            })
        }
    })

    next()
}

//========== ADMIN LOGIN ==========//
app.post('/admin/login', function(request, result) {
    let data = request.body
      var email = data.email;
      var password = data.password;
      if (email && password) {
          db.query('select * from admin where email = ? and password = ?', [email, password], function(error, results, fields) {
              if (results.length > 0) {
          let token = jwt.sign(data.email + '|' +data.password, adminKey)
          result.json({
            success: true,
            message: 'Logged In',
            token: token
          });
              } else {
                  result.json({
            success: false,
            message: 'Invalid Credential!',
          });
              }
              result.end();
          });
      }
  });


//========== ADMIN CAR SECTION ==========//
app.get('/admin/car', adminAuth, (req, res) => {
    let sql = `
      select * from car
    `
    db.query(sql, (err, result) => {
      if (err) throw err

      res.json({
          success: true,
          message: 'Success Retrieving All Car',
          data: result
          })
      })
})

app.get('/admin/car/:id', adminAuth, (req, res) => {
    let sql = `
        select * from car
        where id_car = `+req.params.id+`
        limit 1
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Success Getting Car From ID",
            data: result[0]
        })
    })
})
