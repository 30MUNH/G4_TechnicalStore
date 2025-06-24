import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { NamedEntity } from "@/common/NamedEntity";
import { CartItem } from "@/Cart/cartItem.entity";
import { OrderDetail } from "@/order/orderDetail.entity";
import { Category } from "./categories/category.entity";

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

    @OneToMany(() => CartItem, (cartItem) => cartItem.product)
    cartItems: CartItem[];

    @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.product)
    orderDetails: OrderDetail[];

    @ManyToOne(() => Category, (category) => category.products)
    category: Category;
}
