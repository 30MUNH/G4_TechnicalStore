import { BaseEntity } from "@/common/BaseEntity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { Product } from "../product.entity";

//edit later
// @Entity('laptops')
export class Laptop extends BaseEntity {
  @OneToOne(() => Product)
  @JoinColumn()
  product: Product;

  @Column({ type: 'varchar', length: 50 })
  brand: string;

  @Column({ type: 'varchar', length: 100 })
  model: string;

  @Column({ type: 'varchar', length: 100 })
  cpu: string;

  @Column({ type: 'varchar', length: 100 })
  gpu: string;

  @Column({ type: 'int', name: 'ram_gb' })
  ramGb: number;

  @Column({ type: 'int', name: 'storage_gb' })
  storageGb: number;

  @Column({ type: 'varchar', length: 50, name: 'storage_type' })
  storageType: string;

  @Column({ type: 'decimal', precision: 4, scale: 1, name: 'screen_size' })
  screenSize: number;

  @Column({ type: 'varchar', length: 50 })
  resolution: string;

  @Column({ type: 'decimal', precision: 4, scale: 1, name: 'battery_life_hours' })
  batteryLifeHours: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, name: 'weight_kg' })
  weightKg: number;

  @Column({ type: 'varchar', length: 50, name: 'os' })
  os: string;
}