import { Column, Entity, OneToMany } from "typeorm";
import { CartItem } from "@/Cart/cartItem.entity";
import { NamedEntity } from "@/common/NamedEntity";

@Entity('products')
export class Product extends NamedEntity {
    @Column({ nullable: true })
    url: string;

    @Column({ default: true })
    active: boolean;
    @Column({nullable: true, type: 'double precision'})
    price: number;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    stock: number;

    @Column({ nullable: true })
    category: string;

    @OneToMany(() => CartItem, (cartItem) => cartItem.product)
    cartItems: CartItem[];
}
