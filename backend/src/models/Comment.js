const {Schema, model} = require('mongoose');

const CommentSchema = new Schema ({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post_id: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
    },
    content: {
        type: String,
        required: true
    },
    reply_comment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },
    like: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

module.exports = model('Comment', CommentSchema);