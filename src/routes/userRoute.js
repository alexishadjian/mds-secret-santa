const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const jwtMiddleWare = require('../middlewares/jwtMiddleware');


router
    .route('/register')
    .post(userController.userRegister)

router
    .route('/login')
    .post(userController.userLogin)

router
    .route('/:user_id')
    .all(jwtMiddleWare.verifyToken)
    .get(userController.getUser)
    .put(userController.userUpdate)
    .delete(userController.userDelete)

router
    .route('/:user_id/santa')
    .get(userController.getSantaResult)

module.exports = router;