const authConfig = require('../config/auth');
const jwt = require('jsonwebtoken');

module.exports = {
    // CRIA O TOKEN DE AUTENTICAÇÃO
    async create(params) {
        const token = await jwt.sign(params, authConfig.secret, {
            expiresIn: 86400    // Token expirará em 1 dia
        });
        
        return token;
    }
}