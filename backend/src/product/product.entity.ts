import { CartItem } from "@/cart/cartItem.entity";
import { NamedEntity } from "@/common/NamedEntity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity('products')
export class Product extends NamedEntity{
    @Column()
    price: number;

    @Column()
    description: string;

    @Column()
    stock: number;

    @Column()
    category: string;

    @OneToMany(() => CartItem, (cartItem) => cartItem.product)
    cartItems: CartItem[];
}