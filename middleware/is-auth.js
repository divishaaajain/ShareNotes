const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const tokenHeader = req.get('Authorization');
    if(!tokenHeader){
        const error = new Error('Unauthorized');
        error.statusCode = 401;
        throw error;
    }
    const token = tokenHeader.split(' ')[1];
    jwt.verify(token, 'somereallyprivatekey', (err, decoded) =>{
        if(err) {                              // technical error
            throw err;                           
        }
        if(!decoded){                          // not technical error - but unable to verify the token
            const error = new Error('Authorization failed');
            error.statusCode = 401;
            throw error;
        }
        req.userId = decoded.userId;
        next();
    })    
};