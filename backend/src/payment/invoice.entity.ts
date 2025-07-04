import { BaseEntity } from "@/common/BaseEntity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { Payment } from "./payment.entity";

@Entity('invoices')
export class Invoice extends BaseEntity {
  @OneToOne(() => Payment)
  @JoinColumn()
  payment: Payment;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;
}