const Post = require('../models/Post');
const Comment = require('../models/Comment');

module.exports = {
    async createLikePost(request, response) {
        const userId = request.userId;
        const {postId} = request.params;
        
        const postExists = await Post.findById(postId);
        
        // Verifica se o post que ganhará like existe
        if (!postExists)
            return response.status(400).json({'error': 'This post does not exist'});

        // Verifica se o usuário já deu like no post
        if (postExists.like.includes(userId))
            return response.status(400).json({'error': 'This post already contains your like'});
        
        // Tenta criar o like no post
        try {
            postExists.like.push(userId);
            await postExists.save();

        } catch (error) {
            return response.status(400).json({'error': error});
        }

        return response.status(204).end();    // Código 204 pois não retorna nenhum conteúdo
    },

    async createLikeComment(request, response) {
        const userId = request.userId;
        const {commentId} = request.params;

        const commentExists = await Comment.findById(commentId);

        // Verifica se o comentário que ganhará like existe
        if (!commentExists)
            return response.status(400).json({'error': 'This comment does not exist'});

        // Verifica se o usuário já deu like no post
        if (commentExists.like.includes(userId))
            return response.status(400).json({'error': 'This comment already contains your like'});

        // Tenta criar o like no comentário
        try {
            commentExists.like.push(userId);
            await commentExists.save();

        } catch (error) {
            return response.status(400).json({'error': error});
        }

        return response.status(204).end();    // Código 204 pois não retorna nenhum conteúdo
    },
    
    async deleteLikePost(request, response) {
        const userId = request.userId;
        const {postId} = request.params;

        const postExists = await Post.findById(postId);

        // Verifica se o post que será removido o like existe
        if (!postExists)
            return response.status(400).json({'error': 'This post does not exist'});

        // Verifica se o usuário já deu like no post
        if (!postExists.like.includes(userId))
            return response.status(400).json({'error': 'You did not like this post'});
        
        // Tenta remover o like no post
        try {
            const valueIndex = postExists.like.indexOf(userId);
            postExists.like.splice(valueIndex, 1);

            await postExists.save();

        } catch (error) {
            return response.status(400).json({'error': error});
        }

        return response.status(204).end();    // Código 204 pois não retorna nenhum conteúdo
    },

    async deleteLikeComment(request, response) {
        const userId = request.userId;
        const {commentId} = request.params;

        const commentExists = await Comment.findById(commentId);

        // Verifica se o comentário que será removido o like existe
        if (!commentExists)
            return response.status(400).json({'error': 'This comment does not exist'});

        // Verifica se o usuário já deu like no comentário
        if (!commentExists.like.includes(userId))
            return response.status(400).json({'error': 'You did not like this comment'});

        // Tenta remover o like do comentário
        try {
            const valueIndex = commentExists.like.indexOf(userId);
            commentExists.like.splice(valueIndex, 1);

            await commentExists.save();

        } catch (error) {
            return response.status(400).json({'error': error});
        }

        return response.status(204).end();    // Código 204 pois não retorna nenhum conteúdo
    }
};