import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {UserRole} from "@backend/generated/prisma/enums";

export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-custom'){
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        } as any);
    }
    async validate(payload: JwtPayload){
        return{
            id: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
}