if (process.env.RUNTIME === "AUTOPILOT"){
    console.log("environment is set to AUTOPILOT, so taking en vars from Secret Manager:")
    require('./environment-config/autopilot')
} else {
    console.log("environment is not set to AUTOPILOT, so using pre-set env vars")
    require('./db/mongoose')
}

const express = require('express')
const userRouter = require('./routers/user.js')
const taskRouter = require('./routers/task.js')

// //to help with authentication / validating JWT tokens:
// //without middleware: new request -> run route handle
// //with middleware: new request -> do something -> run route handler
// const auth = require('./middleware/auth.js')

const app = express()
const port = process.env.PORT


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port, () => {
    console.log('Server is up on port '+ port)
})

// const Task = require('./models/task')
// const User = require('./models/user')

// const main = async () => {
//     // const task = await Task.findById('63dc0115d6cdeb0cd67466b8')
//     // await task.populate('owner')
//     // console.log(task.owner)

//     const user = await User.findById('63dbfb43240e0be70f8d7444')
//     await user.populate('tasks')
//     console.log(user.tasks)
// }

// main()






// const jwt = require('jsonwebtoken')

// const myFunction = async () => {
//     const mySecret = 'Tu1inw1?'
//     const token = jwt.sign({ _id: 'abc123' }, mySecret, { expiresIn: '1 day'}) //Synchronous Sign with default (HMAC SHA256). Here we do not have a private key, we just have some private string that we use in the algorithm to sign with. So the 'signing' is using private key with algorithm to encrypt the user id. We send that back to the user, and they have to send it to us for further requests. We can always validate as we have the private string. Bad actor cannot break in if they get user's password, because even if they have correct user/pass, they do not have the signed JWT token and there is no way to fake that without knowing the private string
//     console.log(token) 

//     //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJhYmMxMjMiLCJpYXQiOjE2NzUxODk1MzR9.APNnHn9CH4xeXC1hneg3DtMbEgMxNOYqM6m3y0gnlIw
//     // ^^ above is header.payload.signiture 
//     // header = info such as the algo used
//     // payload = our data provided, base64decoded. you can decode it at base64decode.com. So this is not protecting that data being sent. A hacker could make this bit up. But it can't falsefy the signiture
//     // signiture used to verify

//     //Synchronous Sign with RSA SHA256
//     //var privateKey = fs.readFileSync('private.key');
//     //var token = jwt.sign({ _id: 'abc123' }, privateKey, { algorithm: 'RS256' });
//     // here, we're using public / private keys, so the advantage is that the user knows the JWT has been signed by the private key, and therefore by the server (as knowone else has the private key), as successfully decrypting with the public key shows it had to be encrypted with the private key

//     const data = jwt.verify(token, mySecret)
//     console.log(data)


// }

// myFunction()