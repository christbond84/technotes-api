const express = require("express")
const router = express.Router()
const usersController = require("../controllers/usersController")
const verifyAdminJWT = require("../middleware/verifyAdminJWT")

router
  .route("/")
  .get(usersController.getAllUsers)
  .post(verifyAdminJWT, usersController.createNewUser)
  .patch(verifyAdminJWT, usersController.updateUser)
  .delete(verifyAdminJWT, usersController.deleteUser)

module.exports = router
