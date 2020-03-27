const {Schema, model} = require('mongoose');
const crypto = require('crypto');

const UserSchema = new Schema ({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    picture: {
        type: String,
        default: 'defaultProfilePicture.jpg'
    },
    website: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false   // Não retorna a senha a menos que seja explicitado a seleção da mesma
    },
    description: {
        type: String,
    }
}, {
    timestamps: true
});

// Cria o hash MD5 da senha antes de salvar no banco
UserSchema.pre('save', async function(next) {
    const hash = crypto.createHash('md5').update(this.password).digest('hex');
    this.password = hash;

    next()
});

module.exports = model('User', UserSchema);