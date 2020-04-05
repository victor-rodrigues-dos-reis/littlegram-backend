const Comment = require('../models/Comment');
const User = require('../models/User');
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
            const {_id} = await Comment.create({
                author: userId,
                post_id: postId,
                content
            });
            
            createdComment = await Comment.aggregate([{
                $match: {
                    _id: ObjectId(_id)
                }
            },{
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                },
            },{
                $unwind: "$author"
            },{
                $addFields : {
                    has_liked: {$in: ["$author._id", "$like"]},
                    count_like: {$size: '$like'},
                    reply: [],
                    "author.picture": {$concat: ["http://localhost:3333/files/", "$author.picture"]},
                }
            },{
                $project : {"author.password": 0, like: 0}
            }]);
        }
        catch (error) {
            return response.status(400).json({'error': error});

        }

        return response.status(201).json(createdComment[0]);
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

    async readAllPostComments(postId) {
        let allComments;

        const postExists = await Post.findById(postId);

        // Verifica se o post existe
        if (!postExists)
            throw new Error('This post does not exist');

        // Tenta selecionar todas os comentários de um post
        // juntamente com os dados do author do comentário
        try {
            allComments = await Comment.aggregate([{
                $match: {
                    post_id: ObjectId(postId)
                }
            },{
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                },
            },{
                $unwind: "$author"
            },{
                $addFields : {
                    has_liked: {$in: ["$author._id", "$like"]},
                    count_like: {$size: '$like'},
                    "author.picture": {$concat: ["http://localhost:3333/files/", "$author.picture"]},
                }
            },{
                $project : {"author.password": 0, like: 0}
            }]);
        }
        catch (error) {
            throw new Error(error);
        }

        return allComments;
    }
};