const Post = require('../models/Post');
const CommentController = require('../controllers/CommentController');
const ReplyController = require('../controllers/ReplyController');
const {ObjectId} = require('mongodb');

module.exports = {
    // CRIA UM POST
    async create(request, response) {
        const userId = request.userId;
        const {filename} = request.file;
        const {description} = request.body;

        const createdPost = await Post.create({
            author: userId,
            visual_media: filename,
            description
        });
        
        return response.status(201).json(createdPost);
    },

    // SELECIONA UM POST
    async read(request, response) {
        const {postId} = request.params;
        
        // Esse try catch foi criado para casos em que o id informado não é válido pelo mongodb
        try {
            // Coleta todos os dados do post
            // juntamente com os dados do autor do post
            selectedPost = await Post.aggregate([{
                $match: {
                    _id: ObjectId(postId)
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
            }]);

            // Coleta todos os comentários do post
            allComments = await CommentController.readAllPostComments(postId);

            // Será procurado replies para cada comentário do post
            for (const index in allComments) {
                // coleta as respostas do comentário
                allCommentsReplies = await ReplyController.readAllCommentReply(allComments[index]._id);

                // adiciona as respostas para key "reply" do comentário
                allComments[index].reply = allCommentsReplies;
            }

            selectedPost[0].comments = allComments;

        }
        catch(error) {
            return response.status(400).json({'error': error});
        }
        
        // Verifica se o post solicitado foi encontrado
        if (selectedPost == null)
            return response.status(400).json({'error': 'This post does not exist'})


        return response.json(selectedPost[0]);
    },

    // ATUALIZA UM USUÁRIO
    async update(request, response) {
        response.send('update');
    },

    // DELETA UM POST
    async delete(request, response) {
        const {postId} = request.params;
        const userId = request.userId;
        let deletedPost, isPostOwner;

        const postExists = await Post.findById(postId);

        // Verifica se o post existe
        if (!postExists)
            return response.status(400).json({'error': 'This post does not exist'});

        // Tenta excluir o post
        try {
            deletedPost = await Post.findOneAndRemove({
                $and: [{'author': userId}, {'_id': postId}]
            });
        }
        catch(error) {
            return response.status(400).json({'error': error});
        }

        // Se 'deletedPost' for igual a null significa que o post não pertence ao usuário logado
        if (deletedPost == null)
            return response.status(400).json({'error': "Selected post doesn't belong to logged in user"});

        return response.status(204).end();  // Código 204 pois não retorna nenhum conteúdo

    },

    // SELECIONA TODOS OS POST DE UM USUÁRIO
    async readAllUserPosts(request, response) {
        const {userId} = request.params;
        let allPosts, userExists;

        // Tenta pesquisar pelo usuário informado
        try {
            userExists = User.findById(userId);
        }
        catch(error) {
            return response.status(400).json({'error': error});
        }

        // Verifica se o usuário existe
        if (!userExists)
            return response.status(400).json({'error': 'This user does not exist'});

        // Tenta selecionar todos os posts do usuário
        try {
            allPosts = await Post.find({'author': userId});
        }
        catch(error) {
            return response.status(400).json({'error': error});
        }

        return response.json(allPosts);
    },

    // SELECIONA TODOS OS POSTS QUE O USUÁRIO SEGUE
    async readAllFollowingPosts(request, response) {
        console.log('sdf')
    }
}