const User = require('../models/User');
const Auth = require('./AuthController');
const crypto = require('crypto');

module.exports = {
    async create(request, response) {
        let {credential, password} = request.body;
        let token, username, picture, id;

        // Transforma a senha em um Hash MD5 igual está no banco de dados
        password = crypto.createHash('md5').update(password).digest('hex');

        // Verifica se existe já existe alguem com o username ou o email solicitado
        const userExists = await User.findOne({
            $or: [
                {username: credential, password},
                {email: credential, password}
            ]});

        // Verifica se o usuário existe e se a senha corresponde ao usuário
        if (!userExists)
            return response.status(400).json({'error': "Username doesn't exists or the password is wrong"});

        // Tenta criar o token
        try {
            token = await Auth.create({
                "id": userExists._id,
                "username": userExists.username
            });

        } catch (error) {
            return response.status(400).json({'error': error});

        }

        username = userExists.username;
        picture = "http://localhost:3333/files/" + userExists.picture;
        id = userExists._id;

        return response.status(200).json({token, 'user': {username, picture, id}});
    }
}