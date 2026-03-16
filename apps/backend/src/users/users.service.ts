import { Injectable } from '@nestjs/common';
import {PrismaService} from "@backend/prisma/prisma.service";
import {User, Prisma} from "@backend/generated/prisma/client";

export type UserResponseType = Omit<User, 'passwordHash'>;
export type UserCreateDataType = Prisma.UserCreateInput;
export type UserUpdateDataType = Prisma.UserUpdateInput;
@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {
    }
    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email }
        }) ;
    }

    async findById(id: string):Promise<UserResponseType | null> {
        return this.prisma.user.findUnique({
            where: { id },
            select:{
            id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                tourOperatorId: true,
        }
        });
    }

    async create(data: UserCreateDataType){
        return this.prisma.user.create({data})
    }

    async update(id:string, data: UserUpdateDataType) {
        return this.prisma.user.update({
            where: {id},
            data,
        })
    }
}
