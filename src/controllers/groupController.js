const Group = require('../models/groupModel');
const User = require('../models/userModel');


exports.createAGroup = async (req, res) => {
    try {
        const user = await User.findById(req.params.user_id);
        
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
        
        //Check if user is admin    
        if (req.params.user_id !== group.admin_id) {
            return res.status(500).json({ message: 'Vous devez être administrateur pour modifier le groupe' });
        }
        
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

        //Check if user is admin    
        if (req.params.user_id !== group.admin_id) {
            return res.status(500).json({ message: 'Vous devez être administrateur pour supprimer le groupe' });
        }
        
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