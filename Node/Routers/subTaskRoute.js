const express = require('express')
const router = express.Router()
const subCon = require('../Controller/subTaskController')
const auth = require('../auth')

router.post("/add", auth, subCon.addSubtask);
router.get("/:taskId", auth, subCon.getSubtasksByTask);
router.put("/update/:id", auth, subCon.updateSubtask);
router.delete("/delete/:id", auth, subCon.deleteSubtask);
router.put("/updateParent", auth, subCon.updateSubtaskParent);
module.exports = router;