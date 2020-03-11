const Comment = require('../models/Comment');
const Post = require('../models/Post');
const {ObjectId} = require('mongodb');

module.exports = {
    async create(request, response) {
        const userId = request.userId;
        const {postId, content} = request.body;
        let createdComment;

        const postExists = await Post.findById(postId);

        // Verifica se o post em que será comentádo existe
        if (!postExists)
            return response.status(400).json({'error': 'This post does not exist'});

        // Tenta criar o comentário
        try {
            createdComment = await Comment.create({
                author: userId,
                post_id: postId,
                content
            });
        }
        catch (error) {
            return response.status(400).json({'error': error});

        }

        return response.status(201).json(createdComment);
    },

    async update(request, response) {
        const userId = request.userId;
        const {commentId, content} = request.body;
        let updatedComment;

        const commentExists = await Comment.findById(commentId);
        const isCommentAuthor = await Comment.findOne({
            author: userId,
            _id: commentId
        });

        // Verifica se o comentário existe
        if (!commentExists)
            return response.status(400).json({'error': 'This comment does not exist'});

        // Verifica se o usuário logado é o autor do comentário
        if (!isCommentAuthor)
            return response.status(400).json({'error': 'The logged user is not the author of this comment'})

        // Tenta atualizar o comentário
        try {
            updatedComment = await Comment.findByIdAndUpdate(commentId, {content}, {new: true});

        }
        catch (error) {
            return response.status(400).json({'error': error});
        }

        return response.status(200).json(updatedComment);
    },

    async delete(request, response) {
        const userId = request.userId;
        const {commentId} = request.params;

        const commentExists = await Comment.findById(commentId);
        const isCommentAuthor = await Comment.findOne({
            author: userId,
            _id: commentId
        });

        // Verifica se o comentário existe
        if (!commentExists)
            return response.status(400).json({'error': 'This comment does not exist'});

        // Verifica se o usuário logado é o autor do comentário
        if (!isCommentAuthor)
            return response.status(400).json({'error': 'The logged user is not the author of this comment'});

        // Tenta deletar o comentário
        try {
            await Comment.findByIdAndDelete(commentId);

        }
        catch (error) {
            return response.status(400).json({'error': error});
        }

        return response.status(204).end();  // Código 204 pois não retorna nenhum conteúdo
    },

    async readAllPostComments(request, response) {
        const {postId} = request.params;
        let allComments;

        const postExists = await Post.findById(postId);

        // Verifica se o post existe
        if (!postExists)
            return response.status(400).json({'error': 'This post does not exist'});

        console.log(ObjectId(postId));

        // Tenta selecionar todas os comentários de um post juntamente com suas respostas
        try {
            allComments = await Comment.aggregate([{
                $match: {
                    post_id: ObjectId(postId)
                }
            },{
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "reply_comment",
                    as: "reply"
                },
            }]);
        }
        catch (error) {
            return response.status(400).json({'error': error});
        }

        return response.status(200).json(allComments);
    }
};