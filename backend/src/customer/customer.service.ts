import { Service } from "typedi";
import { Account } from "@/auth/account/account.entity";
import { Role } from "@/auth/role/role.entity";
import { CreateCustomerDto, UpdateCustomerDto } from "./dtos/customer.dtos";
import { EntityNotFoundException } from "@/exceptions/http-exceptions";
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 8;

@Service()
export class CustomerService {
  async createCustomer(createCustomerDto: CreateCustomerDto): Promise<Account> {
    // Kiểm tra username đã tồn tại chưa
    const existingAccount = await Account.findOne({ 
      where: { username: createCustomerDto.username } 
    });
    if (existingAccount) {
      throw new Error("Username đã được sử dụng");
    }

    // Lấy role customer
    const customerRole = await Role.findOne({ 
      where: { slug: "customer" } 
    });
    if (!customerRole) {
      throw new Error("Customer role not found. Please create 'customer' role first.");
    }

    const account = new Account();
    account.username = createCustomerDto.username;
    account.password = await bcrypt.hash(createCustomerDto.password, SALT_ROUNDS);
    account.phone = createCustomerDto.phone;
    account.role = customerRole;
    account.isRegistered = true;
    
    // Sử dụng name field của NamedEntity cho fullName
    account.name = createCustomerDto.fullName;

    await account.save();
    return account;
  }

  async getAllCustomers(): Promise<Account[]> {
    const customerRole = await Role.findOne({ where: { slug: "customer" } });
    if (!customerRole) return [];

    return await Account.find({
      where: { role: { id: customerRole.id } },
      relations: ["role", "customerOrders"],
      order: { createdAt: "DESC" }
    });
  }

  async getCustomerById(id: string): Promise<Account> {
    const account = await Account.findOne({
      where: { id },
      relations: ["role", "customerOrders"]
    });
    
    if (!account || account.role.slug !== "customer") {
      throw new EntityNotFoundException("Customer");
    }
    
    return account;
  }

  async getCustomerByUsername(username: string): Promise<Account> {
    const account = await Account.findOne({
      where: { username },
      relations: ["role", "customerOrders"]
    });
    
    if (!account || account.role.slug !== "customer") {
      throw new EntityNotFoundException("Customer");
    }
    
    return account;
  }

  async updateCustomer(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Account> {
    const account = await this.getCustomerById(id);

    // Kiểm tra username trùng (nếu có update username)
    if (updateCustomerDto.username && updateCustomerDto.username !== account.username) {
      const existingAccount = await Account.findOne({ 
        where: { username: updateCustomerDto.username } 
      });
      if (existingAccount) {
        throw new Error("Username đã được sử dụng");
      }
    }

    // Update fields
    if (updateCustomerDto.username) account.username = updateCustomerDto.username;
    if (updateCustomerDto.fullName) account.name = updateCustomerDto.fullName;
    if (updateCustomerDto.phone) account.phone = updateCustomerDto.phone;
    if (updateCustomerDto.password) {
      account.password = await bcrypt.hash(updateCustomerDto.password, SALT_ROUNDS);
    }

    await account.save();
    return account;
  }

  async deleteCustomer(id: string): Promise<void> {
    const account = await this.getCustomerById(id);
    await account.softRemove();
  }

  async searchCustomers(searchTerm: string): Promise<Account[]> {
    const customerRole = await Role.findOne({ where: { slug: "customer" } });
    if (!customerRole) return [];

    return await Account.createQueryBuilder("account")
      .innerJoinAndSelect("account.role", "role")
      .where("role.slug = :roleSlug", { roleSlug: "customer" })
      .andWhere("(account.name ILIKE :term OR account.username ILIKE :term OR account.phone ILIKE :term)", 
        { term: `%${searchTerm}%` })
      .getMany();
  }
}
