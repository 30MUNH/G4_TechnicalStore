import { Service } from "typedi";
import { Account } from "@/auth/account/account.entity";
import { Role } from "@/auth/role/role.entity";
import { CreateCustomerDto, UpdateCustomerDto } from "./dtos/customer.dtos";
import { EntityNotFoundException, BadRequestException } from "@/exceptions/http-exceptions";
import * as bcrypt from 'bcrypt';
import { DbConnection } from "@/database/dbConnection";
import { Cart } from "@/Cart/cart.entity";
import { Feedback } from "@/feedback/feedback.entity";
import { SMSNotification } from "@/notification/smsNotification.entity";
import { Marketing } from "@/marketing/marketing.entity";
import { RefreshToken } from "@/auth/jwt/refreshToken.entity";

const SALT_ROUNDS = 8;

@Service()
export class CustomerService {
  private validatePhoneNumber(phone: string): void {
    // Support both formats: 0xxxxxxxxx (10 digits) or +84xxxxxxxxx (12 chars)
    const phoneRegex = /^(0\d{9}|\+84\d{9})$/;
    if (!phoneRegex.test(phone)) {
      throw new BadRequestException('Số điện thoại không hợp lệ. Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx');
    }
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException('Mật khẩu phải có ít nhất 8 ký tự');
    }
    if (!/\d/.test(password)) {
      throw new BadRequestException('Mật khẩu phải chứa ít nhất 1 số');
    }
    if (!/[a-zA-Z]/.test(password)) {
      throw new BadRequestException('Mật khẩu phải chứa ít nhất 1 chữ cái');
    }
  }

  private validateUsername(username: string): void {
    if (username.length < 3 || username.length > 50) {
      throw new BadRequestException('Username phải có độ dài từ 3 đến 50 ký tự');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new BadRequestException('Username chỉ được chứa chữ cái, số và dấu gạch dưới');
    }
  }

  async createCustomer(createCustomerDto: CreateCustomerDto): Promise<Account> {
    try {
      const dataSource = await DbConnection.getConnection();
      if (!dataSource) {
        throw new BadRequestException("Database connection not available");
      }

      return await dataSource.manager.transaction(async transactionalEntityManager => {
        // Validate fields
        this.validateUsername(createCustomerDto.username);
        this.validatePassword(createCustomerDto.password);
        this.validatePhoneNumber(createCustomerDto.phone);

        // Check for existing account
        const existingAccount = await transactionalEntityManager.findOne(Account, { 
          where: [
            { username: createCustomerDto.username },
            { phone: createCustomerDto.phone }
          ]
        });

        if (existingAccount) {
          if (existingAccount.username === createCustomerDto.username) {
            throw new BadRequestException("Username đã được sử dụng");
          }
          if (existingAccount.phone === createCustomerDto.phone) {
            throw new BadRequestException("Số điện thoại đã được sử dụng");
          }
        }

        const customerRole = await transactionalEntityManager.findOne(Role, { 
          where: { name: "customer" } 
        });
        if (!customerRole) {
          throw new BadRequestException("Customer role not found. Please create 'customer' role first.");
        }

        const account = new Account();
        account.username = createCustomerDto.username;
        account.password = await bcrypt.hash(createCustomerDto.password, SALT_ROUNDS);
        account.phone = createCustomerDto.phone;
        account.role = customerRole;
        account.isRegistered = true;
        account.name = createCustomerDto.fullName;

        return await transactionalEntityManager.save(account);
      });
    } catch (error) {
      console.error('❌ [CustomerService] Error in createCustomer:', error);
      throw error;
    }
  }

  async getAllCustomers(): Promise<Account[]> {
    const dataSource = await DbConnection.getConnection();
    if (!dataSource) return [];

    const roleRepo = dataSource.getRepository(Role);
    const accountRepo = dataSource.getRepository(Account);

    const customerRole = await roleRepo.findOne({ where: { name: "customer" } });
    if (!customerRole) return [];

    return await accountRepo.find({
      where: { role: { id: customerRole.id } },
      relations: ["role", "customerOrders"],
      order: { createdAt: "DESC" }
    });
  }

  async getCustomerById(id: string): Promise<Account> {
    const dataSource = await DbConnection.getConnection();
    if (!dataSource) {
      throw new BadRequestException("Database connection not available");
    }

    const accountRepo = dataSource.getRepository(Account);
    const account = await accountRepo.findOne({
      where: { id },
      relations: ["role", "customerOrders"]
    });
    
    if (!account || account.role.name !== "customer") {
      throw new EntityNotFoundException("Customer");
    }
    
    return account;
  }

  async getCustomerByUsername(username: string): Promise<Account> {
    const dataSource = await DbConnection.getConnection();
    if (!dataSource) {
      throw new BadRequestException("Database connection not available");
    }

    const accountRepo = dataSource.getRepository(Account);
    const account = await accountRepo.findOne({
      where: { username },
      relations: ["role", "customerOrders"]
    });
    
    if (!account || account.role.name !== "customer") {
      throw new EntityNotFoundException("Customer");
    }
    
    return account;
  }

  async updateCustomer(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Account> {
    try {
      const dataSource = await DbConnection.getConnection();
      if (!dataSource) {
        throw new BadRequestException("Database connection not available");
      }

      return await dataSource.manager.transaction(async transactionalEntityManager => {
        const account = await this.getCustomerById(id);

        if (updateCustomerDto.username) {
          this.validateUsername(updateCustomerDto.username);
          if (updateCustomerDto.username !== account.username) {
            const existingAccount = await transactionalEntityManager.findOne(Account, { 
              where: { username: updateCustomerDto.username } 
            });
            if (existingAccount) {
              throw new BadRequestException("Username đã được sử dụng");
            }
          }
        }

        if (updateCustomerDto.phone) {
          this.validatePhoneNumber(updateCustomerDto.phone);
          if (updateCustomerDto.phone !== account.phone) {
            const existingAccount = await transactionalEntityManager.findOne(Account, { 
              where: { phone: updateCustomerDto.phone } 
            });
            if (existingAccount) {
              throw new BadRequestException("Số điện thoại đã được sử dụng");
            }
          }
        }

        if (updateCustomerDto.password) {
          this.validatePassword(updateCustomerDto.password);
          account.password = await bcrypt.hash(updateCustomerDto.password, SALT_ROUNDS);
        }

        // Update other fields
        if (updateCustomerDto.username) account.username = updateCustomerDto.username;
        if (updateCustomerDto.fullName) account.name = updateCustomerDto.fullName;
        if (updateCustomerDto.phone) account.phone = updateCustomerDto.phone;

        return await transactionalEntityManager.save(account);
      });
    } catch (error) {
      console.error('❌ [CustomerService] Error in updateCustomer:', error);
      throw error;
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    try {
      const dataSource = await DbConnection.getConnection();
      if (!dataSource) {
        throw new BadRequestException("Database connection not available");
      }

      return await dataSource.manager.transaction(async transactionalEntityManager => {
        const account = await this.getCustomerById(id);

        // Xóa mềm cart liên kết (nếu có)
        const cart = await transactionalEntityManager.findOne(Cart, { 
          where: { account: { id: account.id } } 
        });
        if (cart) {
          await transactionalEntityManager.softRemove(cart);
        }

        // Xóa mềm feedback liên kết
        const feedbacks = await transactionalEntityManager.find(Feedback, { 
          where: { account: { id: account.id } } 
        });
        if (feedbacks.length > 0) {
          await transactionalEntityManager.softRemove(feedbacks);
        }

        // Xóa mềm SMS notifications liên kết
        const smsNotifications = await transactionalEntityManager.find(SMSNotification, { 
          where: { account: { id: account.id } } 
        });
        if (smsNotifications.length > 0) {
          await transactionalEntityManager.softRemove(smsNotifications);
        }

        // Xóa mềm marketing campaigns liên kết
        const marketingCampaigns = await transactionalEntityManager.find(Marketing, { 
          where: { account: { id: account.id } } 
        });
        if (marketingCampaigns.length > 0) {
          await transactionalEntityManager.softRemove(marketingCampaigns);
        }

        // Xóa mềm refresh tokens liên kết
        const refreshTokens = await transactionalEntityManager.find(RefreshToken, { 
          where: { account: { id: account.id } } 
        });
        if (refreshTokens.length > 0) {
          await transactionalEntityManager.softRemove(refreshTokens);
        }

        // Cuối cùng xóa mềm account
        await transactionalEntityManager.softRemove(account);
      });
    } catch (error) {
      console.error('❌ [CustomerService] Error in deleteCustomer:', error);
      throw error;
    }
  }

  async searchCustomers(searchTerm: string): Promise<Account[]> {
    const dataSource = await DbConnection.getConnection();
    if (!dataSource) return [];

    const roleRepo = dataSource.getRepository(Role);
    const customerRole = await roleRepo.findOne({ where: { name: "customer" } });
    if (!customerRole) return [];

    return await dataSource.createQueryBuilder(Account, "account")
      .innerJoinAndSelect("account.role", "role")
      .where("role.name = :roleName", { roleName: "customer" })
      .andWhere("(account.name ILIKE :term OR account.username ILIKE :term OR account.phone ILIKE :term)", 
        { term: `%${searchTerm}%` })
      .getMany();
  }
}
