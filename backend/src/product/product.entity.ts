import { Column, Entity } from "typeorm";
import { CartItem } from "@/Cart/cartItem.entity";
import { NamedEntity } from "@/common/NamedEntity";

@Entity('products')
export class Product extends NamedEntity {
    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false, unique: true })
    code: string;

    @Column({ nullable: false })
    categoryName: string;

    @Column({ nullable: true })
    url: string;

    @Column({ default: true })
    active: boolean;
}
