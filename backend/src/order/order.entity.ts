import { Account } from "@/auth/account/account.entity";
import { BaseEntity } from "@/common/BaseEntity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { OrderDetail } from "./orderDetail.entity";
import { Payment } from "@/payment/payment.entity";
import { OrderStatus } from "./dtos/update-order.dto";

@Entity('orders')
export class Order extends BaseEntity {
  @ManyToOne(() => Account, (account) => account.customerOrders)
  @JoinColumn({ name: 'customer_id' })
  customer: Account;

  @ManyToOne(() => Account, (account) => account.shipperOrders)
  @JoinColumn({ name: 'staff_id' })
  shipper: Account;

  @Column()
  orderDate: Date;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({ nullable: true })
  shippingAddress: string;

  @Column({ nullable: true })
  note: string;

  @Column({ nullable: true })
  cancelReason: string;

  @Column({ nullable: true, name: 'payment_method' })
  paymentMethod: string;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  orderDetails: OrderDetail[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];
}