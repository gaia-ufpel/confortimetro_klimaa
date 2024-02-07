import crypto from 'crypto';
import bcrypt from 'bcrypt';

// APP_SECRET é usado para reforçar a segurança da aplicação
const APP_SECRET = process.env.APP_SECRET || 'secret';

// authentication serve para gerar um hash de senha
export const authentication = (salt: string, password: string): string => {
    return crypto.createHmac('sha256', [salt, password].join(':')).update(APP_SECRET).digest('hex');
}

// random server para gerar um token aleatório
export const random = (): string => crypto.randomBytes(256).toString('base64');