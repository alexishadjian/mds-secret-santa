const jwt = require('jsonwebtoken');
const jws = require('jws');
const jwtkey = process.env.JWT_KEY;

exports.verifyToken = async(req, res, next) => {
    try {
        const token = req.headers['authorization'];
        
        if (token !== undefined) {
            const payload = await new Promise((resolve, reject) => {
                jwt.verify(token, jwtkey, (error, decoded) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(decoded);
                    }
                });
            });
    
            req.user = payload;
            next();
        } else {
            res.status(403).json({message: "Accès interdit: token manquant"})
        }
    } catch (error) {
        console.log(error);
        res.status(403).json({message: "Accès interdit: token invalide"});
    }
}

exports.verifiyTokenInvitation = async (req, res, next) => {
    try {
        const token = req.header('invitation');

        if (token !== undefined) {
            const payload = await new Promise((resolve, reject) => {
                jwt.verify(token, jwtkey, (error, decoded) => {
                    if(error) {
                        reject(error);
                    }
                    else {
                        resolve(decoded);
                    }
                });
            });

            req.user = payload;
            next();
        } 
        else {
            res.status(403).json({message: 'Accès interdit: token '});
        }
    }
    catch (error) {
        console.log(error);
        res.status(403).json({message: "Accès interdit: token "});

    }
}


exports.decode = function (jwt, options) {
  options = options || {};
  var decoded = jws.decode(jwt, options);
  if (!decoded) { return null; }
  var payload = decoded.payload;

  return payload;
};