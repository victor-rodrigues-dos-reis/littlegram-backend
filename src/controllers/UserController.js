const User = require('../models/User');
const Auth = require('../controllers/AuthController');
const Post = require('../controllers/PostController');
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
        const {userIdentifier} = request.params;
        let selectedUser;

        // Tenta encontrar o usuário solicitado no banco pelo ID
        try {
            selectedUser = await User.findById(userIdentifier);
        }
        catch(error) {
            // Tenta encontrar o usuário solicitado no banco pelo username
            try {
                // seleciona as informações do usuário através do username;
                selectedUser = await User.aggregate([{
                    $match: {
                        username: userIdentifier
                    }
                },{
                    $lookup: {
                        from: "followings",
                        localField: "_id",
                        foreignField: "user",
                        as: "following"
                    }
                },{
                    $lookup: {
                        from: "followings",
                        localField: "_id",
                        foreignField: "following",
                        as: "follower"
                    }
                },{
                    $addFields: {
                        count_follower: {$size: "$follower"},
                        count_following: {$size: "$following"},
                        picture: {$concat: ["http://localhost:3333/files/", "$picture"]},
                    }
                },{
                    $project: {follow: 0, password: 0}
                }]);

                selectedUser = selectedUser[0];
                selectedUser.posts = await Post.readAllUserPosts(selectedUser._id);
            }
            catch(error) {
                return response.status(400).json({'error': error});
            }
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
        let updatedUser;

        // Tenta atualizar o usuário
        try {
            updatedUser = await User.findByIdAndUpdate(userId, modifications, {new: true});  // 'new: true' retorna a informação já atualizada
        }
        catch (error) {
            return response.status(400).json({'error': error});
        }

        return response.status(200).json(updatedUser);
    },

    // ATUALIZA A SENHA DE USUÁRIO
    async updatePassword(request, response) {
        let {currentPassword, newPassword} = request.body;
        const userId = request.userId;
        let updatedUser;

        const user = await User.findById(userId, 'password');

        // Cria o hash das senhas
        currentPassword = crypto.createHash('md5').update(currentPassword).digest('hex');
        newPassword = crypto.createHash('md5').update(newPassword).digest('hex');

        // Verifica se a senha enviada é igual a senha no banco
        if (currentPassword !== user.password)
            return response.status(400).json({'error': "Current password is wrong"});

        // Tenta atualizar a senha do usuário
        try {
            await User.findByIdAndUpdate(userId, {'password': newPassword});
        }
        catch (error) {
            return response.status(400).json({'error': error});
        }

        return response.status(204).end();
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

    async updateProfilePicture(request, response) {
        const userId = request.userId;
        const {filename} = request.file;
        let user;

        // Tenta atualizar a foto de perfil do usuário
        try {
            user = await User.findByIdAndUpdate(userId, {picture: filename}, {new: true});
        }
        catch (error) {
            return response.status(400).json({'error': error});
        }

        return response.status(200).json("http://localhost:3333/files/"+user.picture);
    }
};