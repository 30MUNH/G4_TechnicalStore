import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { Role } from "../auth/role.entity";

@Entity()
export class Account extends BaseEntity{
    @Column({nullable: false})
    username!: string;

    @Column({nullable: false})
    password!: string;

    @ManyToOne(() => Role, (role) => role.accounts)
    role!: Role;
}