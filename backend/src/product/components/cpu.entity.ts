import { Column, Entity, JoinColumn, OneToOne, OneToMany } from "typeorm";
import { Product } from "../product.entity";
import { BaseEntity } from "@/common/BaseEntity";
import { Build } from "@/rfq/build.entity";

@Entity("cpus")
export class CPU extends BaseEntity {
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

  @OneToMany(() => Build, (build) => build.cpu)
  builds: Build[];
}
