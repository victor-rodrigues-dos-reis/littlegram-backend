const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

module.exports = (request, response, next) => {
    const authHeader = request.headers.authorization;

    // Verifica se o token foi enviado na requisição
    if (!authHeader)
        return response.status(401).send({'error': 'No token provided'});
    
    const parts = authHeader.split(' ');

    // Verifica se o token contém 2 partes
    // Normalmente um token tem uma extrutura semelhante a isso "..."
    if (parts.length !== 2)
        return response.status(401).send({'error': 'Token error'});

    const [scheme, token] = parts;

    // Verifica se a primeira parte do token contém a palavra "Bearer"
    if (!scheme.includes('Bearer'))
        return response.status(401).send({'error': 'Token malformatted'});

    // Verifica se o token digitado é válido
    jwt.verify(token, authConfig.secret, (error, decoded) => {
        if (error)
            return response.status(401).send({'error': 'Token invalid'});

        request.userId = decoded.id;

        return next();
    });
}