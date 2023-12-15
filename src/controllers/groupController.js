const Group = require('../models/groupModel');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const jwtMiddleWare = require('../middlewares/jwtMiddleware');


exports.createAGroup = async (req, res) => {
    try {
        const user = await User.findById(req.params.user_id);

        //Check if user exist
        if (!user) return res.status(500).json({ message: 'Utilisateur introuvable' });
        
        const newGroup = new Group({
            ...req.body,
            admin_id: req.params.user_id,
        });

        newGroup.members.push(user);

        try {
            const group = await newGroup.save();
            res.status(201);
            res.json(group);
        } catch (error) {
            res.status(500).json({message: 'Erreur serveur'});
        }
    } catch (error) {
        res.status(500).json({message: 'Utilisateur non trouvé'});
    }
};

exports.getAGroup = async (req, res) => {
    
    try {
        const group = await Group.findById(req.params.group_id);

        //Check if group exist
        if (!group) return res.status(500).json({ message: 'Groupe introuvable' });

        if (group) {
            res.status(200);
            res.json(group);
        } else {
            res.status(204);
            res.json({ message: "Le groupe n'existe plus"});
        }

    } catch {
        res.status(500);
        console.log(error);
        res.json({message: 'Erreur serveur'});
    }

}

exports.updateAGroup = async (req, res) => {

    try {
        const group = await Group.findByIdAndUpdate(req.params.group_id, req.body, {new: true});
        const user = await User.findById(req.params.user_id);

        //Check if user exist
        if (!user) return res.status(500).json({ message: 'Utilisateur introuvable' });
        
        //Check if group exist
        if (!group) return res.status(500).json({ message: 'Groupe introuvable' });

        //Check if user is admin    
        if (req.params.user_id !== group.admin_id) return res.status(500).json({ message: 'Vous devez être administrateur pour modifier le groupe' });
        
        res.status(200);
        res.json(group);
    } catch (error) {
        res.status(500);
        console.log(error);
        res.json({message: 'Erreur serveur'});
    }

}

exports.deleteAGroup = async (req, res) => {
    
    try {
        const group = await Group.findByIdAndDelete(req.params.group_id);
        const user = await User.findById(req.params.user_id);

        //Check if user exist
        if (!user) return res.status(500).json({ message: 'Utilisateur introuvable' });

        //Check if group exist
        if (!group) return res.status(500).json({ message: 'Groupe introuvable' });

        //Check if user is admin    
        if (req.params.user_id !== group.admin_id) return res.status(500).json({ message: 'Vous devez être administrateur pour supprimer le groupe' });
        
        if (group) {
            res.json({message: 'Groupe supprimé'});
            res.status(200);
        } else {
            res.json({message: 'Ce groupe n\'existe pas'});
            res.status(204);
        }

    } catch {
        res.status(500);
        console.log(error);
        res.json({message: 'erreur serveur'});
    }
}

exports.sendInvitation = async (req, res) => {

    try {
        const group = await Group.findById(req.params.group_id);
        const user = await User.findById(req.params.user_id);
        const userInvited = await User.findOne({ email: req.body.email });

        //Check if user exist
        if (!user) return res.status(500).json({ message: 'Utilisateur introuvable' });
        
        //Check if group exist
        if (!group) return res.status(500).json({ message: 'Groupe introuvable' });

        //Check if user invited exist
        let userCreated;
        if (!userInvited) {
            //Create the user
            const newUser = new User({
                email: req.body.email,
                password: 'evijlbzzpoj'
            });
            await newUser.save();
            userCreated = await User.findOne({ email: newUser.email });
        }
        //Check if user is already in the groupe
        if (group.members.includes(userInvited._id)) return res.status(500).json({ message: "L'utilisateur est déjà dans le groupe" });

        //Check if user is admin    
        if (req.params.user_id !== group.admin_id) return res.status(500).json({ message: 'Vous devez être administrateur pour envoyer une invitation' });

        const userData = {
            id: userInvited._id || userCreated.id,
            email: userInvited.email || userCreated.email,
        }
        const token = await jwt.sign(userData, process.env.JWT_KEY, {expiresIn: "2h"})
        res.status(200).json({token});

    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Une erreur s'est produite lors du traitement"})
    }

}

exports.acceptInvitation = async (req, res) => {

    try {
        const group = await Group.findById(req.params.group_id);
        const user = await User.findById(req.params.user_id);

        const token = req.headers['invitation'];
        const payload = jwtMiddleWare.decode(token);
        const userInvited = await User.findById(payload.id);

        //Check if user exist
        if (!user) return res.status(500).json({ message: 'Utilisateur introuvable' });
        
        //Check if group exist
        if (!group) return res.status(500).json({ message: 'Groupe introuvable' });

        //Check if user is already in the groupe
        if (group.members.includes(userInvited.id)) return res.status(500).json({ message: "L'utilisateur est déjà dans le groupe" });

        group.members.push(userInvited);

        try {
            const groupUpdated = await group.save();
            res.status(201);
            res.json(groupUpdated);
        } catch (error) {
            res.status(500).json({message: 'Erreur serveur'});
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Une erreur s'est produite lors du traitement"})
    }
}