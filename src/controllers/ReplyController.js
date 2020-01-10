const Comment = require('../models/Comment');

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
    
    async readAllCommentReply(request, response) {
        const {commentId} = request.params;
        let allReply;

        const commentExists = await Comment.findById(commentId);

        // Verifica se o comentário existe
        if (!commentExists)
            return response.status(400).json({'error': 'This comment does not exist'});

        // Tenta selecionar todas as resposta de um comentário
        try {
            allReply = await Comment.find({reply_comment: commentId});
        }
        catch (error) {
            return response.status(400).json({'error': error});
        }

        return response.status(200).json(allReply);
    },
    
};