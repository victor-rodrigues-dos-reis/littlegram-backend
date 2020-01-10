const {Schema, model} = require('mongoose');

const PostSchema = new Schema ({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    visual_media: {
        type: String,
        required: true 
    },
    description: {
        type: String,
        required: true
    },
    like: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

module.exports = model('Post', PostSchema);