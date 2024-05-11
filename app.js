const express = require('express')
const app = express()
app.use(express.json())

const path = require('path')
const dbPath = path.join(__dirname, 'userData.db')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const bcrypt = require('bcrypt')
const nodemon = require('nodemon')

let db = null

const initilization = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running At http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DATABASE Error ${error.message}`)
    process.exit(1)
  }
}

initilization()

const validationPassord = password => {
  return password.length > 4
}

// API 1

app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const hashedPassword = await bcrypt.hash(password, 10)
  const userExistense = `select * from user where username = '${username}'`
  const dbUser = await db.get(userExistense)
  if (dbUser === undefined) {
    const userQuery = `
    INSERT INRO
    user(username, name, password, gender, location)
    values('${username}','${name}','${hashedPassword}','${gender}','${location}')
    `
    if (validationPassord(password)) {
      await db.run(userQuery)
      response.status(200)
      respone.send('User created successfully')
    } else {
      response.status(400)
      response.send('Password is too short')
    }
  } else {
    response.status(400)
    response.send('User already exists')
  }
})

// API 2

app.post('/login', async (request, response) => {
  const {username, password} = request.body
  const registeredUser = `select * from user where username = '${username}'`
  const dbUser = await db.get(registeredUser)
  if (dbUser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const comaprePaassword = await bcrypt.compare(password, dbUser.password)
    if (comaprePaassword === true) {
      response.status(200)
      response.send('Login success!')
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})

// API 3

app.put('/change-password', async (request, response) => {
  const {username, oldPassword, newPassword} = request.body
  const checkingQuery = `selsect * from user where username = '${username}'`
  const dbUser = await db.get(checkingQuery)
  if (dbUser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const comparePassword = await bcrypt.hash(oldPassword, dbUser.password)
    if (comparePassword === true) {
      if (validationPassord(newPassword)) {
        const newhasedpassword = await bcrypt.hash(newPassword, 10)
        const updatePassword = `
        update
        user
        set
        password = '${newhasedpassword}'
        where 
        username = '${username}'
        `
        await db.run(updatePassword)
        response.send(200)
        response.send('Password updated')
      } else {
        response.status(400)
        response.send('Password is too short')
      }
    } else {
      response.status(400)
      response.send('Invalid current password')
    }
  }
})

module.exports = app
