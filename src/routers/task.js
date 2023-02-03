const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
    
    //const task = new Task(req.body)
    const task = new Task({ // this version now adds the user that created the task
        ...req.body,
        owner: req.user._id
    })
    
    // task.save().then(() => {
    //     res.status(201).send(task)
    // }).catch((e) => {
    //     res.status(400).send(e)
    // })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
    
})

router.get('/tasks', auth, async (req, res) => {
    // Task.find({}).then((tasks) => {
    //     res.status(200).send(tasks)
    // }).catch((e) => {
    //     res.status(500).send(e)
    // })
    
    const match = {}
    
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    const options = {}
    
    if (req.query.limit) {
        options.limit = parseInt(req.query.limit)
    }

    if (req.query.skip) {
        options.skip = parseInt(req.query.skip)
    }

    if (req.query.sortBy) {
        options.sort = {}
        const parts = req.query.sortBy.split(':')
        sortDirection = parts[1] === 'desc' ? -1 : 1
        options.sort[parts[0]] = sortDirection
    }

    console.log(options.sort)

    try {
        // const tasks = await Task.find({
        //     owner: req.user._id //this means we filter the tasks back by a matching task ID and a matching owner. so someone with the right task id that is not the owner will respond a 404
        // }) 
        // res.status(200).send(tasks) //this works. but so does the two lines below:
        await req.user.populate({
            path: 'tasks',
            match,
            options
        })
        res.status(200).send(req.user.tasks)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    
    // Task.findById(_id).then((task) => {
    //     if (!task) {
    //         return res.status(404).send()            
    //     }

    //     res.send(task)
        
    // }).catch((e) => {
    //     res.status(500).send(e)
    // })

    try {
        //const task = await Task.findById(_id) // this would find any task by ID. But we only want tasks from the authenticated user. 
        const task = await Task.findOne({
            _id,
            owner: req.user._id //this means we filter the tasks back by a matching task ID and a matching owner. so someone with the right task id that is not the owner will respond a 404
        })


        if (!task) {
            return res.status(404).send()            
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }

})

router.patch('/tasks/:id', auth, async (req, res) => {

    const updates = Object.keys(req.body) 
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation){
        return res.status(400).send({error: 'Invalid updates!'})
    }

    try {
        
        // this still works, but to align with the user router, let's set this up so it would work if we wanted to use it with mongoose middleware
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
         
        //instead we need the following to manually update the task*
        
        // const task = await Task.findById(req.params.id) // changing so we can also get by the owner
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => {
            task[update] = req.body[update]
        })

        await task.save()
        //ending here*

        
        


        res.status(200).send(task)
    } catch (e) {
        return res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        // const task = await Task.findById(req.params.id) // changing so we can also get by the owner
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        return res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router