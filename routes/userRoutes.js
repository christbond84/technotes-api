const express = require("express")
const router = express.Router()
const usersController = require("../controllers/usersController")
const verifyAdminJWT = require("../middleware/verifyAdminJWT")

router.use(verifyAdminJWT)
router
  .route("/")
  .get(usersController.getAllUsers)
  .post(usersController.createNewUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser)

module.exports = router
