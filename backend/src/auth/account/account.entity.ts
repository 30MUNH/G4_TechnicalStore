import { Column, Entity, ManyToOne } from "typeorm";
import { NamedEntity } from "@/common/NamedEntity";
import { Role } from "@/auth/role/role.entity";

@Entity('accounts')
export class Account extends NamedEntity{
    @Column({nullable: false, unique: true})
    username: string;

    @Column({nullable: false})
    password: string;

    @ManyToOne(() => Role, (role) => role.accounts)
    role: Role;
}