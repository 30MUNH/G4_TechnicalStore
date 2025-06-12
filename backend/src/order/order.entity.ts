import { Account } from "@/auth/account/account.entity";
import { BaseEntity } from "@/common/BaseEntity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { OrderDetail } from "./orderDetail.entity";
import { Payment } from "@/payment/payment.entity";

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

  @Column()
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  orderDetails: OrderDetail[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];
}