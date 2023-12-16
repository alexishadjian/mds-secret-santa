const Group = require('../models/groupModel');
const Santa = require('../models/santaModel');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const jwtMiddleWare = require('../middlewares/jwtMiddleware');

function generateRandomPassword(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset.charAt(randomIndex);
    }
    return password;
}

exports.createAGroup = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        const payload = jwtMiddleWare.decode(token);
        const user = await User.findById(payload.id);

        //Check if user exist
        if (!user) return res.status(500).json({ message: 'Utilisateur introuvable' });
        
        const newGroup = new Group({
            ...req.body,
            admin_id: user._id,
        });

        newGroup.members.push(user);
        user.groups.push(newGroup);

        try {
            const group = await newGroup.save();
            await user.save();
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
        const token = req.headers['authorization'];
        const payload = jwtMiddleWare.decode(token);
        const user = await User.findById(payload.id);

        const group = await Group.findByIdAndUpdate(req.params.group_id, req.body, {new: true});

        //Check if user exist
        if (!user) return res.status(500).json({ message: 'Utilisateur introuvable' });
        
        //Check if group exist
        if (!group) return res.status(500).json({ message: 'Groupe introuvable' });

        //Check if user is admin    
        if (payload.id !== group.admin_id) return res.status(500).json({ message: 'Vous devez être administrateur pour modifier le groupe' });
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
        const token = req.headers['authorization'];
        const payload = jwtMiddleWare.decode(token);
        const user = await User.findById(payload.id);

        const group = await Group.findByIdAndDelete(req.params.group_id);

        //Check if user exist
        if (!user) return res.status(500).json({ message: 'Utilisateur introuvable' });

        //Check if group exist
        if (!group) return res.status(500).json({ message: 'Groupe introuvable' });

        //Check if user is admin    
        if (payload.id !== group.admin_id) return res.status(500).json({ message: 'Vous devez être administrateur pour supprimer le groupe' });
        
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
        const token = req.headers['authorization'];
        const payload = jwtMiddleWare.decode(token);
        const user = await User.findById(payload.id);

        const group = await Group.findById(req.params.group_id);
        const userInvited = await User.findOne({ email: req.body.email });

        // Check if user exist
        if (!user) return res.status(500).json({ message: 'Utilisateur introuvable' });

        // Check if group exist
        if (!group) return res.status(500).json({ message: 'Groupe introuvable' });

        // Check if user invited exist
        let userCreated;
        if (!userInvited) {
            // Create the user
            const newUser = new User({
                email: req.body.email,
                password: generateRandomPassword(10)
            });
            await newUser.save();
            userCreated = await User.findOne({ email: newUser.email });
        } else {
            // Check if user is already in the group
            if (group.members.includes(userInvited?._id)) {
                return res.status(500).json({ message: "L'utilisateur est déjà dans le groupe" });
            }
        }
        console.log(payload)
        // Check if user is admin
        if (payload.id !== group.admin_id) return res.status(500).json({ message: 'Vous devez être administrateur pour envoyer une invitation' });

        const userId = userInvited?._id || userCreated?._id;
        const userEmail = userInvited?.email || userCreated?.email;

        const userData = {
            id: userId,
            email: userEmail,
        };
        const invitationToken = await jwt.sign(userData, process.env.JWT_KEY, { expiresIn: "2h" });
        res.status(200).json({ invitationToken });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Une erreur s'est produite lors du traitement" });
    }
};


exports.acceptInvitation = async (req, res) => {

    try {
        const group = await Group.findById(req.params.group_id);

        const token = req.headers['authorization'];
        const payload = jwtMiddleWare.decode(token);
        const user = await User.findById(payload.id);

        const invitationToken = req.headers['invitation'];
        const invitationPayload = jwtMiddleWare.decode(invitationToken);
        const userInvited = await User.findById(invitationPayload.id);


        //Check if user exist
        if (!user) return res.status(500).json({ message: 'Utilisateur introuvable' });
        
        //Check if group exist
        if (!group) return res.status(500).json({ message: 'Groupe introuvable' });

        //Check if this is the right user
        if (payload.id !== invitationPayload.id ) return res.status(500).json({ message: 'Cette invitation ne vous est pas destinée'})

        //Check if user is already in the groupe
        if (group.members.includes(userInvited.id)) return res.status(500).json({ message: "L'utilisateur est déjà dans le groupe" });

        group.members.push(userInvited);
        userInvited.groups.push(group);

        await userInvited.save();

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

exports.startSanta = async (req, res) => {

    try {
        const token = req.headers['authorization'];
        const payload = jwtMiddleWare.decode(token);
        
        const group = await Group.findById(req.params.group_id);

        //Check if user is admin    
        if (payload.id !== group.admin_id) return res.status(500).json({ message: 'Vous devez être administrateur pour supprimer le groupe' });

        if (!group || !group.members || group.members.length < 2) return res.status(400).json({ message: "Le groupe n'est pas valide pour le Secret Santa." });

        //Shuffle the members
        const shuffledMembers = group.members.sort(() => Math.random() - 0.5);

        //Create Secret Santa pairs
        const secretSantaPairs = shuffledMembers.map((sender, index) => ({
            sender: sender,
            receiver: shuffledMembers[(index + 1) % shuffledMembers.length],
            group_id: req.params.group_id,
        }));

        //Save Secret Santa pairs
        await Santa.insertMany(secretSantaPairs);

        res.status(200).json({ message: "Attribution du Secret Santa réussie." });

    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Une erreur s'est produite lors du traitement"})
    }
    
}