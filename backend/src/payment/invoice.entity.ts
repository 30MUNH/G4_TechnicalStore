import { BaseEntity } from "@/common/BaseEntity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { Payment } from "./payment.entity";
import { Order } from "@/order/order.entity";

export enum InvoiceStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

@Entity('invoices')
export class Invoice extends BaseEntity {
  @ManyToOne(() => Order, (order) => order.invoices)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @OneToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment?: Payment;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  invoiceNumber: string | null;



  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.UNPAID
  })
  status: InvoiceStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentMethod: string | null; // 'COD', 'VNPAY', etc.

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}