const express = require('express');
const multer = require('multer');

const uploadConfig = require('./config/upload');

const authMiddleware = require('./middleware/auth');
const uploadMiddleware = multer(uploadConfig);

const routes = express.Router();

const LoginController = require('./controllers/LoginController');
const UserController = require('./controllers/UserController');
const FollowController = require('./controllers/FollowController');
const PostController = require('./controllers/PostController');
const CommentController = require('./controllers/CommentController');
const ReplyController = require('./controllers/ReplyController');
const LikeController = require('./controllers/LikeController');

// Rotas de login
routes.post('/login', LoginController.create);

// Rotas do usuário
routes.post('/user', UserController.create);
routes.get('/user/:userIdentifier', UserController.read);
routes.get('/search/:content', UserController.search);
routes.put('/user', authMiddleware, UserController.update);
routes.put('/user/password', authMiddleware, UserController.updatePassword);
routes.put('/user/picture', authMiddleware, uploadMiddleware.single('picture'), UserController.updateProfilePicture);
routes.delete('/user', authMiddleware, UserController.delete);

// Rotas de seguir
routes.post('/follow/:followingId', authMiddleware, FollowController.create);
routes.delete('/unfollow/:followingId', authMiddleware, FollowController.delete);

// Rotas de postagem
routes.post('/post', authMiddleware, uploadMiddleware.single('visual_media'), PostController.create);
routes.get('/post/:postId', PostController.read);
routes.get('/post/user/following/', authMiddleware, PostController.readAllFollowingPosts);
// routes.put('/post', authMiddleware, PostController.update);
routes.delete('/post/:postId', authMiddleware, PostController.delete);

// Rotas de comentário
routes.post('/comment', authMiddleware, CommentController.create);
routes.put('/comment', authMiddleware, CommentController.update);
routes.delete('/comment/:commentId', authMiddleware, CommentController.delete);

// Rotas de resposta
routes.post('/reply', authMiddleware, ReplyController.create);
routes.put('/reply', authMiddleware, ReplyController.update);
routes.delete('/reply/:replyId', authMiddleware, ReplyController.delete);

// Rotas de like/dislike
routes.post('/like/post/:postId', authMiddleware, LikeController.createLikePost);
routes.post('/like/comment/:commentId', authMiddleware, LikeController.createLikeComment);
routes.delete('/dislike/post/:postId', authMiddleware, LikeController.deleteLikePost);
routes.delete('/dislike/comment/:commentId', authMiddleware, LikeController.deleteLikeComment);

// Rota verificação do token
routes.get('/token/check/validity', authMiddleware, (request, response) => {
    return response.status(200).json({'message': 'Token is valid'});
});

module.exports = routes;