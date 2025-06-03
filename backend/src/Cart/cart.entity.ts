import { Column, Entity} from "typeorm";
import { BaseEntity } from "@/common/BaseEntity";

@Entity()
export class Cart extends BaseEntity {
    @Column({nullable: false, unique: true })
    cart_id: string;

    @Column({  nullable: false })
    customer_id: string;

    @Column({  nullable: false })
    created_at: Date;
}