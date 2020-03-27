const User = require('../models/User');
const Following = require('../models/Following');

module.exports = {
    // FOLLOW UM USUÁRIO
    async create(request, response) {
        const userId = request.userId;
        const {followingId} = request.params;

        const followingExists = await User.findById(followingId);
        const isFollowing = await Following.findOne({user: userId, following: followingId});

        // Verifica se o usuário está tentado seguir a si mesmo
        if (followingId == userId) {
            return response.status(400).json({'error': 'You cannot follow yourself'});
        }

        // Verifica se o usuário que será seguido existe
        if (!followingExists)
            return response.status(400).json({'error': 'This user that you want to follow does not exist'});

        // Verifica se o usuário já está seguindo o usuário selecionado
        if (isFollowing) {
            return response.status(400).json({'error': 'You are already following that user'});
        }

        try {
            await Following.create({user: userId, following: followingId});

        }
        catch (error) {
            return response.status(400).json({'error': error});
        }

        return response.status(204).end();  // Código 204 pois não retorna nenhum conteúdo
    },

    // UNFOLLOW UM USUÁRIO
    async delete(request, response) {
        const userId = request.userId;
        const {followingId} = request.params;

        const followingExists = await User.findById(followingId);
        const isFollowing = await Following.findOne({user: userId, following: followingId});

        // Verifica se o usuário que será seguido existe
        if (!followingExists)
            return response.status(400).json({'error': 'This user that you want to unfollow does not exist'});

        // Verifica se o usuário realmente segue o usuário selecionado
        if (!isFollowing) {
            return response.status(400).json({'error': 'You are not following that user'});
        }

        // Tenta dar unfollow 
        try {
            await Following.findOneAndDelete({user: userId, following: followingId});

        }
        catch (error) {
            return response.status(400).json({'error': error});
        }

        return response.status(204).end();  // Código 204 pois não retorna nenhum conteúdo
    },

    async readAllFollowing(userId) {
        let allFollowing, arrayFollowing = [];

        // Tenta selecionar todos os usuário que um user está seguindo
        try {
            allFollowing = await Following.find({user: userId}, {"following": 1, "_id": 0});

        }
        catch (error) {
            throw new Error(error);
        }

        allFollowing.map((data) => {
            arrayFollowing.push(data.following);
        });

        return arrayFollowing;
    }
}