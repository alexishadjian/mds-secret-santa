const express = require('express');
const router = express.Router();

const groupController = require('../controllers/groupController');
const jwtMiddleWare = require('../middlewares/jwtMiddleware');


router
    .route('/:user_id/group')
    .post(groupController.createAGroup)

router
    .route('/:user_id/group/:group_id')
    .delete(groupController.deleteAGroup)
    .put(groupController.updateAGroup)

router
    .route('/group/:group_id')
    .get(groupController.getAGroup)

// router
//     .route('/:user_id/group/invite')
//     .post(groupController.inviteAMember)

// router
//     .route(':user_id/group/accept')
//     .put(groupController.userUpdate)

// router
//     .route(':user_id/group/decline')
//     .put(groupController.userUpdate)

module.exports = router;