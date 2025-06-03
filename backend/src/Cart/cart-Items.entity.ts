import { Column, Entity, ManyToOne, BaseEntity } from "typeorm";
import { Cart } from "./cart.entity";

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