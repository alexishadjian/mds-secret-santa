const express = require('express');
const router = express.Router();

const groupController = require('../controllers/groupController');
const jwtMiddleWare = require('../middlewares/jwtMiddleware');


router
    .route('/')
    .all(jwtMiddleWare.verifyToken)
    .post(groupController.createAGroup)

router
    .route('/:group_id')
    .all(jwtMiddleWare.verifyToken)
    .get(groupController.getAGroup)
    .put(groupController.updateAGroup)
    .delete(groupController.deleteAGroup)

router
    .route('/:group_id/invite')
    .post(groupController.sendInvitation)

router
    .route('/:group_id/accept')
    .post(jwtMiddleWare.verifiyTokenInvitation, groupController.acceptInvitation)

router
    .route('/:group_id/decline')
    .post(jwtMiddleWare.verifiyTokenInvitation, groupController.declineInvitation)

router
    .route('/:group_id/start')
    .all(jwtMiddleWare.verifyToken)
    .post(groupController.startSanta)
    

module.exports = router;