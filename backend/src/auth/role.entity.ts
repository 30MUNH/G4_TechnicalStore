import { Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { Account } from "../account/account.entity";

@Entity()
export class Role extends BaseEntity{
    @OneToMany(() => Account, (account) => account.role)
    accounts!: Account[];
}