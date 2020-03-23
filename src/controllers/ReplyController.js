const Comment = require('../models/Comment');
const {ObjectId} = require('mongodb');

module.exports = {
    async create(request, response) {
        const userId = request.userId;
        const {commentId, content} = request.body;
        let createdReply;

        const commentExists = await Comment.findById(commentId);

        // Verifica se o comentário que será respondido existe
        if (!commentExists)
            return response.status(400).json({'error': 'This comment does not exist'});

        // Tenta criar a resposta
        try {
            createdReply = await Comment.create({
                author: userId,
                content,
                reply_comment: commentId
            });
        }
        catch (error) {
            return response.status(400).json({'error': error});

        }

        return response.status(201).json(createdReply);
    },
    
    async update(request, response) {
        const userId = request.userId;
        const {replyId, content} = request.body;
        let updatedReply;

        const replyExists = await Comment.findById(replyId);
        const isReplyAuthor = await Comment.findOne({
            author: userId,
            _id: replyId
        });

        // Verifica se a resposta existe
        if (!replyExists)
            return response.status(400).json({'error': 'This reply does not exist'});

        // Verifica se o usuário logado é o autor da resposta
        if (!isReplyAuthor)
            return response.status(400).json({'error': 'The logged user is not the author of this reply'})

        // Tenta atualizar a resposta
        try {
            updatedReply = await Comment.findByIdAndUpdate(replyId, {content}, {new: true});

        }
        catch (error) {
            return response.status(400).json({'error': error});
        }

        return response.status(200).json(updatedReply);
    },
    
    async delete(request, response) {
        const userId = request.userId;
        const {replyId} = request.params;

        const replyExists = await Comment.findById(replyId);
        const isReplyAuthor = await Comment.findOne({
            author: userId,
            _id: replyId
        });

        // Verifica se a resposta existe
        if (!replyExists)
            return response.status(400).json({'error': 'This reply does not exist'});

        // Verifica se o usuário logado é o autor da resposta
        if (!isReplyAuthor)
            return response.status(400).json({'error': 'The logged user is not the author of this reply'});

        // Tenta deletar a resposta
        try {
            await Comment.findByIdAndDelete(replyId);

        }
        catch (error) {
            return response.status(400).json({'error': error});
        }

        return response.status(204).end();  // Código 204 pois não retorna nenhum conteúdo
    },
    
    async readAllCommentReply(commentId) {
        let allReply;

        const commentExists = await Comment.findById(commentId);

        // Verifica se o comentário existe
        if (!commentExists)
            throw new Error('This comment does not exist');

        // Tenta selecionar todas as resposta de um comentário
        // juntamente com os dados do autor da resposta
        try {
            allReply= await Comment.aggregate([{
                $match: {
                    reply_comment: ObjectId(commentId)
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
                $project : {"author.password": 0}
            },{
                $addFields : {
                    has_liked: {$in: ["$author._id", "$like"]}
                }
            }]);
        }
        catch (error) {
            throw new Error(error);
        }

        return (allReply);
    }
    
};