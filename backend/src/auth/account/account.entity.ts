import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { NamedEntity } from "@/common/NamedEntity";
import { Role } from "@/auth/role/role.entity";
import { RefreshToken } from "../jwt/refreshToken.entity";

@Entity('accounts')
export class Account extends NamedEntity{
    @Column({nullable: false, unique: true})
    username: string;

    @Column({nullable: false})
    password: string;

    @Column({nullable: false})
    phone: string;

    @ManyToOne(() => Role, (role) => role.accounts)
    role: Role;

    @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.account)
    refreshTokens: RefreshToken[];
}