const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth.js')
const {sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')
const router = new express.Router()

router.post('/users', async (req, res) => { //defining the function as async means it returns a promise
    const user = new User(req.body)
    // user.save().then(() => {
    //     res.status(201).send(user)
    // }).catch((e) => {
    //     res.status(400).send(e)
    // })
    
    try {
        await user.save() //code below this only runs if the promise is fulfilled. if it throws an error, the catch is thrown. 
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken() //here we also want to log in a user once they go through the signup process. SO let's give them the token now
        res.status(201).send({user, token})
    } catch (e) {
        if (e.code === 11000 && e.index === 0) {
            const customError = {
                error: "email already exists!"
            }
            res.status(400).send(customError)
        } else {
            res.status(400).send()
        }
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)        
        const token = await user.generateAuthToken()
        //res.status(200).send({user: user.getPublicProfile(), token}) //byrenaming the method in the model from getPublicProfile to toJSON. This means toJSON gets called when res.send({user}) is called, and the logic we defined in toJSON(){} will take out the keys we don't want
        res.status(200).send({user, token})
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send(200)
    } catch (e) {
        res.status(500).send()

    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.status(200).send()
    } catch (e) {
        res.status(500).send()

    }
})

router.get('/users/me', auth, async (req, res) => {
    // User.find({}).then((users) => {
    //     res.status(200).send(users)
    // }).catch((e) => {
    //     res.status(500).send(e)
    // })

    // try {
    //     const users = await User.find({})
    //     res.status(200).send(users)
    // } catch (e) {
    //     res.status(500).send(e)
    //}

    // above code is no longer needed, it was just an example, as we don't want anyone to be able to pull all info on all users. Instead we want them to get only their info. Hence the change in adding the /me to the route
    
    res.send(req.user) // this is now possible because in the auth.js middleware, we assign the matching user (based on token and _id) back into req.user
})


// we never want to do this (one user gets other user information) so let's just remove it

// router.get('/users/:id', auth, async (req, res) => {
//     const _id = req.params.id
    
//     // User.findById(_id).then((user) => {
//     //     if (!user) {
//     //         return res.status(404).send()            
//     //     }

//     //     res.send(user)

//     // }).catch((e) => {
//     //     res.status(500).send(e)
//     // })


//     try {
//         const user = await User.findById(_id)
//         if (!user) {
//             return res.status(404).send()            
//         }
//         res.send(user)
//     } catch (e) {
//         res.status(500).send(e)
//     }
// })

router.patch('/users/me', auth, async (req,res) => {
   
    const updates = Object.keys(req.body) 
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation){
        return res.status(400).send({error: 'Invalid updates!'})
    }

    try {
         
        // this doesn't work with the mongoose middleware automatically to handle the hashing of the password.
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        
        //instead we need the followingto manually update the user
        const user = req.user
        updates.forEach((update) => {
            user[update] = req.body[update]
        })

        await user.save()
        //ending here

        res.status(200).send(user)
    } catch (e) {
        return res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)
        return res.status(200).send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000 //1MB
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload a document of type jpg, jpeg or png'))
        }

        cb(undefined, true)
    }
})


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer    
    await req.user.save()
    res.status(200).send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.status(200).send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.status(200).send(user.avatar)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

module.exports = router