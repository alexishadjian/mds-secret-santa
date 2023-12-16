const User = require('../models/userModel');
const Santa = require('../models/santaModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//Create a user
exports.userRegister = async (req,res) => {

    try {
        let newUser = new User(req.body);

        //Check if email is already used
        const mail = await User.findOne({ email: req.body.email });
        if (mail) return res.status(409).json({ message: 'Cette adresse mail est déjà utilisée' });

        let user = await newUser.save();
        res.status(201).json({message: `Utilisateur crée: ${user.email}`})
    } catch (error) {
        console.log(error);
        res.status(400).json({message: "Requête invalide"});
    }

}

//Check logins and return token
exports.userLogin = async (req,res) => {
    try {
        const user = await User.findOne({email: req.body.email});

        if (!user) return res.status(404).json({message: "Utilisateur non trouvé"});

        const password = await bcrypt.compare(req.body.password, user.password);

        if (user.email === req.body.email && password) {
            const userData = {
                id: user._id,
                email: user.email,
                role: user.role,
            }
            const token = await jwt.sign(userData, process.env.JWT_KEY, {expiresIn: "10h"})
            res.status(200).json({token});

        } else {
            res.status(401).json({message: "Email ou mot de passe incorrect"});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Une erreur s'est produite lors du traitement"})
    }
}

//Change user informations
exports.userUpdate = async (req,res) => {

    try {
        const user = await User.findByIdAndUpdate(req.params.user_id, req.body, {new: true});

        //Check if user exist
        if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
        
        res.status(200);
        res.json(user);
    } catch (error) {
        res.status(500);
        console.log(error);
        res.json({message: 'Erreur serveur'});
    }

}

//Delete a user
exports.userDelete = async (req, res) => {
    
    try {
        const user = await User.findByIdAndDelete(req.params.user_id);

        //Check if user exist
        if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

        res.status(200);
        res.json({message: 'Utilisateur supprimé'});

    } catch {
        res.status(500);
        console.log(error);
        res.json({message: 'Erreur serveur'});
    }

}

//Get user informations
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.user_id);
        
        //Check if user exist
        if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

        res.status(200);
        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Erreur serveur'});
    }
};

//Get secret santa results informations 
exports.getSantaResult = async (req, res) => {

    try {

        const user = await User.findById(req.params.user_id);

        if (!user) return res.status(404).json({message: "Utilisateur non trouvé"});

        const santa = await Santa.find({
            $or: [
                { 'sender': req.params.user_id },
                { 'receiver': req.params.user_id }
            ]
        });

        console.log(req.params.user_id)        
        if (!santa) {
            return res.status(404).json({ message: "Aucun Santa trouvé avec cet ID." });
        }

        res.status(200);
        res.json(santa);

    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Une erreur s'est produite lors du traitement"})
    }
    
}