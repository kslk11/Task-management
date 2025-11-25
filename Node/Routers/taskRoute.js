const express = require('express')
const router = express.Router()
const taskCon = require('../Controller/taskController')
const auth = require('../auth')

router.post('/newTask',auth,taskCon.createTask)
router.get('/getAll',auth,taskCon.getTaskby)
router.get('/getAllto',auth,taskCon.getTaskTo)
router.get('/assignedtome',auth,taskCon.getAssignedTasks)
router.get('/assignedbyme',auth,taskCon.getAssignedTasksOthers)
router.post('/updateS',auth,taskCon.updateStatus)
router.post('/sortBystatus/:id',auth,taskCon.sortByStatus)
router.post('/sortBydate/:id',auth,taskCon.sortByDate)
router.get('/gta',auth,taskCon.getTaskCountUser)
router.get('/getOne/:id',auth,taskCon.getOne)
router.delete('/delete/:id',auth,taskCon.deleteTask)
router.put('/taskUpdate/:id',auth,taskCon.updateTask)
router.put("/updateAssignee", auth, taskCon.updateTaskAssignee);


module.exports = router;
