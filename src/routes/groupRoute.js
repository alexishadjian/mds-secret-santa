const express = require('express');
const router = express.Router();

const groupController = require('../controllers/groupController');
const jwtMiddleWare = require('../middlewares/jwtMiddleware');


router
    .route('/:user_id/groups')
    .all(jwtMiddleWare.verifyToken)
    .post(groupController.createAGroup)

router
    .route('/:user_id/groups/:group_id')
    .all(jwtMiddleWare.verifyToken)
    .delete(groupController.deleteAGroup)
    .put(groupController.updateAGroup)

router
    .route('/groups/:group_id')
    .get(groupController.getAGroup)

router
    .route('/:user_id/groups/:group_id/invite')
    .all(jwtMiddleWare.verifyToken)
    .post(groupController.sendInvitation)

router
    .route('/:user_id/groups/:group_id/accept')
    .post(jwtMiddleWare.verifiyTokenInvitation, groupController.acceptInvitation)

// router
//     .route(':user_id/group/decline')
//     .put(groupController.userUpdate)

module.exports = router;