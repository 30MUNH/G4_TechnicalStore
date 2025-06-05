import { Column, JoinColumn, OneToOne } from "typeorm";
import { Product } from "../product.entity";
import { BaseEntity } from "@/common/BaseEntity";

export class Cpu extends BaseEntity{
    @OneToOne(() => Product)
    @JoinColumn()
    product: Product;

    @Column()
    cores: number;

    @Column()
    threads: number;

    @Column()
    baseClock: string;

    @Column()
    boostClock: string;

    @Column()
    socket: string;

    @Column()
    architecture: string;

    @Column()
    tdp: number;

    @Column({ nullable: true })
    integratedGraphics: string;
}