import { Column, Entity, ManyToOne } from "typeorm";
import { Cart } from "./cart.entity";
import { BaseEntity } from "@/common/BaseEntity";

@Entity()
export class CartItem extends BaseEntity {
    @Column({ type: "uuid", nullable: false, unique: true })
    cart_item_id: string;

    @Column({ type: "uuid", nullable: false })
    cart_id: string;

    @Column({ type: "uuid", nullable: false })
    product_id: string;

    @Column({ type: "int", nullable: false })
    quantity: number;

    @ManyToOne(() => Cart, (cart) => cart.cartItems)
    cart: Cart;
}