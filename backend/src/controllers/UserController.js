const User = require('../models/User');
const Auth = require('../controllers/AuthController');
const crypto = require('crypto');

module.exports = {
    // CRIA UM USUÁRIO
    async create(request, response) {
        const {name, username, email, password} = request.body;
        let createdUser;

        // Verifica se existe já existe alguem com o username ou o email solicitado
        const userExists = await User.findOne({
            $or: [{username}, {email}]
        });

        // Verifica se o usuário existe
        if (userExists)
            return response.status(400).json({'error': 'Username or email already being used'});
        
        // Tenta cadastrar o usuário
        try {
            createdUser = await User.create({name, username, email, password});
            createdUser.password = undefined;    // Ao criar o cadastro o banco acaba retornando a senha, por isso precisa ser removida
        }
        catch(error) {
            return response.status(400).json({'error': error});
        }

        // Cria o token
        const token = await Auth.create({
            "id": createdUser._id,
            "username": createdUser.username
        });

        return response.status(201).json({"user": createdUser, token});   // Código 201 pois foi criado um novo conteúdo
    },

    // SELECIONA UM USUÁRIO
    async read(request, response) {
        const {userId} = request.params;
        let selectedUser;

        // Tenta encontrar o usuário solicitado no banco
        try {
            selectedUser = await User.findById(userId);
        }
        catch(error) {
            return response.status(400).json({'error': error});
        }

        // Verifica se o usuário solicitado foi encontrado
        if (selectedUser == null)
            return response.status(400).json({'error': 'This user does not exist'})

        return response.json(selectedUser);
    },

    // ATUALIZA UM USUÁRIO
    async update(request, response) {
        const modifications = request.body;
        const userId = request.userId;
        const contentType = request.get('Content-Type');
        let updatedUser;

        // Verifica se o content-type é json
        if (contentType != 'application/json')
            return response.status(400).json({'error': 'Content-type needs to be application/json'});

        // Tenta atualizar o usuário
        try {
            updatedUser = await User.findByIdAndUpdate(userId, modifications, {new: true});  // 'new: true' retorna a informação já atualizada
        }
        catch (error) {
            return response.status(400).json({'error': error});
        }

        return response.status(200).json(updatedUser);
    },

    // DELETA UM USUÁRIO
    async delete(request, response) {
        let {username, password} = request.headers;
        let deletedUser;
        
        password = crypto.createHash('md5').update(password).digest('hex');

        // Tenta excluir o usuário
        try {
            deletedUser = await User.findOneAndRemove({username, password});

        }
        catch(error) {
            return response.status(400).json({'error': error});
        }

        // Caso o "deletedUser" for null significa que o username ou a senha está errada
        if (deletedUser == null)
            return response.status(401).json({'error': 'Login or password is wrong'});  // Código 401 pois ocorreu um erro de autenticação


        return response.status(204).end();  // Código 204 pois não retorna nenhum conteúdo
    },

};