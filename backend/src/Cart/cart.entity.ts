import { Column, Entity, OneToMany} from "typeorm";
import { BaseEntity } from "@/common/BaseEntity";
import { CartItem } from "./cartItem.entity";

@Entity()
export class Cart extends BaseEntity {
    @Column({nullable: false, unique: true })
    cart_id: string;

    @Column({  nullable: false })
    customer_id: string;

    @Column({  nullable: false })
    created_at: Date;

    @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
    cartItems: CartItem[];
}