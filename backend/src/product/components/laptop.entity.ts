import { BaseEntity } from "@/common/BaseEntity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { Product } from "../product.entity";

@Entity('laptops')
export class Laptop extends BaseEntity {
  @OneToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'varchar', length: 50, nullable: true })
  brand: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  model: string;

  @Column({ type: 'numeric', precision: 4, scale: 1, name: 'screen_size_inch', nullable: true })
  screenSize: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  resolution: string;

  @Column({ type: 'varchar', length: 100, name: 'processor', nullable: true })
  cpu: string;

  @Column({ type: 'int', name: 'ram_gb', nullable: true })
  ramGb: number;

  @Column({ type: 'int', name: 'storage_gb', nullable: true })
  storageGb: number;

  @Column({ type: 'varchar', length: 50, name: 'storage_type', nullable: true })
  storageType: string;

  @Column({ type: 'varchar', length: 100, name: 'graphics', nullable: true })
  graphics: string;

  @Column({ type: 'numeric', precision: 4, scale: 1, name: 'battery_life_hours', nullable: true })
  batteryLifeHours: number;

  @Column({ type: 'numeric', precision: 4, scale: 2, name: 'weight_kg', nullable: true })
  weightKg: number;

  @Column({ type: 'varchar', length: 50, name: 'operating_system', nullable: true })
  operatingSystem: string;
}