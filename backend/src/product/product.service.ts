import { Service } from "typedi";
import { Product } from "./product.entity";
import { Category } from "./categories/category.entity";
import { Repository } from "typeorm";
import { DbConnection } from "@/database/dbConnection";
import { CreateProductDto, UpdateProductDto } from "./dtos/product.dto";
import { CPU } from "./components/cpu.entity";
import "./components/laptop/laptop.entity";
import { PC } from "./components/pc.entity";
import { RAM } from "./components/ram.entity";
import { GPU } from "./components/gpu.entity";
import { PSU } from "./components/psu.entity";
import { Drive } from "./components/drive.entity";
import { Motherboard } from "./components/motherboard.entity";
import { Cooler } from "./components/cooler.entity";
import { Case } from "./components/case.entity";
import { Monitor } from "./components/monitor.entity";
import { Mouse } from "./components/mouse.entity";
import { NetworkCard } from "./components/networkCard.entity";
import { Headset } from "./components/headset.entity";
import { Keyboard } from "./components/keyboard.entity";
import { Laptop } from "./components/laptop/laptop.entity";

const CATEGORY_MAP = {
  cpu: "2cb16a49-e560-479f-9548-842b0bff9e27",
  gpu: "c695708d-0fea-4dd9-8a31-1899fff608b7",
  ram: "434d93f0-4a3b-48f1-806c-3d692bf785ab",
  drive: "1a18778b-8908-4e22-86a8-878e19db8ce4",
  motherboard: "c0ef0604-0349-441b-974f-1a672ed2be28",
  psu: "4f7b323c-4262-4197-bc50-001b3a95f49a",
  cooler: "336caedb-05ce-47c3-bf3c-17e6c905ea45",
  case: "7bb510df-3279-4fe4-a5d0-1bd73da26434",
  headset: "bc077745-98fc-474a-a6b4-48d3cbf1b389",
  keyboard: "c27be34a-dd0e-4364-af3d-0bb4ad23e65d",
  mouse: "d9877734-7c1a-4ff9-a152-d565747ae51c",
  monitor: "1b24da29-8c53-452f-8f85-eab67745fce1",
  "network-card": "fb41576b-7546-46d5-86ca-e4a5b84cffb3",
  laptop: "8d5e884c-150d-4302-9118-ae434778ca27",
  pc: "34d6f233-6782-48af-99fe-d485ccdfc618",
};

@Service()
export class ProductService {
  private productRepository: Repository<Product>;
  private categoryRepository: Repository<Category>;
  private cpuRepository: Repository<CPU>;
  private laptopRepository: Repository<Laptop>;
  private pcRepository: Repository<PC>;
  private ramRepository: Repository<RAM>;
  private gpuRepository: Repository<GPU>;
  private psuRepository: Repository<PSU>;
  private driveRepository: Repository<Drive>;
  private motherboardRepository: Repository<Motherboard>;
  private coolerRepository: Repository<Cooler>;
  private caseRepository: Repository<Case>;
  private monitorRepository: Repository<Monitor>;
  private mouseRepository: Repository<Mouse>;
  private networkCardRepository: Repository<NetworkCard>;
  private headsetRepository: Repository<Headset>;
  private keyboardRepository: Repository<Keyboard>;

  constructor() {
    this.initializeRepositories();
  }

  private async initializeRepositories() {
    const dataSource = await DbConnection.getConnection();
    if (!dataSource) {
      throw new Error("Database connection not available");
    }
    this.productRepository = dataSource.getRepository(Product);
    this.categoryRepository = dataSource.getRepository(Category);
    this.cpuRepository = dataSource.getRepository(CPU);
    this.laptopRepository = dataSource.getRepository(Laptop);
    this.pcRepository = dataSource.getRepository(PC);
    this.ramRepository = dataSource.getRepository(RAM);
    this.gpuRepository = dataSource.getRepository(GPU);
    this.psuRepository = dataSource.getRepository(PSU);
    this.driveRepository = dataSource.getRepository(Drive);
    this.motherboardRepository = dataSource.getRepository(Motherboard);
    this.coolerRepository = dataSource.getRepository(Cooler);
    this.caseRepository = dataSource.getRepository(Case);
    this.monitorRepository = dataSource.getRepository(Monitor);
    this.mouseRepository = dataSource.getRepository(Mouse);
    this.networkCardRepository = dataSource.getRepository(NetworkCard);
    this.headsetRepository = dataSource.getRepository(Headset);
    this.keyboardRepository = dataSource.getRepository(Keyboard);
  }

  async getAllProducts(): Promise<Product[]> {
    await this.ensureRepositories();
    return await this.productRepository.find({
      where: { isActive: true },
      relations: ["category"],
      order: { createdAt: "DESC" },
    });
  }

  async getNewLaptops(limit: number = 8): Promise<Product[]> {
    await this.ensureRepositories();
    return await this.productRepository.find({
      where: {
        isActive: true,
        categoryId: "8d5e884c-150d-4302-9118-ae434778ca27",
      },
      relations: ["category"],
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  async getNewPCs(limit: number = 8): Promise<Product[]> {
    await this.ensureRepositories();
    return await this.productRepository.find({
      where: {
        isActive: true,
        categoryId: "34d6f233-6782-48af-99fe-d485ccdfc618",
      },
      relations: ["category"],
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  async getNewAccessories(limit: number = 8): Promise<Product[]> {
    await this.ensureRepositories();
    // Accessories là các sản phẩm KHÔNG phải laptop, pc
    return await this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .where("product.isActive = :isActive", { isActive: true })
      .andWhere("product.categoryId NOT IN (:...ids)", {
        ids: [
          "8d5e884c-150d-4302-9118-ae434778ca27",
          "34d6f233-6782-48af-99fe-d485ccdfc618",
        ],
      })
      .orderBy("product.createdAt", "DESC")
      .take(limit)
      .getMany();
  }

  async getNewProducts(limit: number = 8) {
    const [laptops, pcs, accessories] = await Promise.all([
      this.getNewLaptops(limit),
      this.getNewPCs(limit),
      this.getNewAccessories(limit),
    ]);
    return { laptops, pcs, accessories };
  }

  async getTopSellingProducts(limit: number = 6): Promise<Product[]> {
    // For now, return products with highest stock (as a proxy for popularity)
    // In a real application, this would be based on actual sales data
    await this.ensureRepositories();
    return await this.productRepository.find({
      where: { isActive: true },
      relations: ["category"],
      order: { stock: "DESC" },
      take: limit,
    });
  }

  async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    // await this.ensureRepositories();
    // const category = await this.categoryRepository.findOne({
    //   where: { slug: categorySlug }
    // });

    // if (!category) {
    //   return [];
    // }

    // return await this.productRepository.find({
    //   where: {
    //     isActive: true,
    //     categoryId: category.id
    //   },
    //   relations: ["category"],
    //   order: { createdAt: "DESC" }
    // });
    const products: Product[] = [];
    return products;
  }

  async getProductById(id: string): Promise<any | null> {
    await this.ensureRepositories();
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
      relations: ["category"],
    });
    if (!product) return null;

    let detail = null;
    const catId = product.categoryId;
    switch (catId) {
      case CATEGORY_MAP.cpu:
        detail = await this.cpuRepository.findOne({
          where: { product: { id } },
        });
        break;
      case CATEGORY_MAP.laptop:
        detail = await this.laptopRepository.findOne({
          where: { product: { id } },
        });
        break;
      case CATEGORY_MAP.pc:
        detail = await this.pcRepository.findOne({
          where: { product: { id } },
        });
        break;
      case CATEGORY_MAP.ram:
        detail = await this.ramRepository.findOne({
          where: { product: { id } },
        });
        break;
      case CATEGORY_MAP.gpu:
        detail = await this.gpuRepository.findOne({
          where: { product: { id } },
        });
        break;
      case CATEGORY_MAP.psu:
        detail = await this.psuRepository.findOne({
          where: { product: { id } },
        });
        break;
      case CATEGORY_MAP.drive:
        detail = await this.driveRepository.findOne({
          where: { product: { id } },
        });
        break;
      case CATEGORY_MAP.motherboard:
        detail = await this.motherboardRepository.findOne({
          where: { product: { id } },
        });
        break;
      case CATEGORY_MAP.cooler:
        detail = await this.coolerRepository.findOne({
          where: { product: { id } },
        });
        break;
      case CATEGORY_MAP.case:
        detail = await this.caseRepository.findOne({
          where: { product: { id } },
        });
        break;
      case CATEGORY_MAP.monitor:
        detail = await this.monitorRepository.findOne({
          where: { product: { id } },
        });
        break;
      case CATEGORY_MAP.mouse:
        detail = await this.mouseRepository.findOne({
          where: { product: { id } },
        });
        break;
      case CATEGORY_MAP["network-card"]:
        detail = await this.networkCardRepository.findOne({
          where: { product: { id } },
        });
        break;
      case CATEGORY_MAP.headset:
        detail = await this.headsetRepository.findOne({
          where: { product: { id } },
        });
        break;
      case CATEGORY_MAP.keyboard:
        detail = await this.keyboardRepository.findOne({
          where: { product: { id } },
        });
        break;
      default:
        detail = null;
    }
    return { ...product, ...detail };
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    await this.ensureRepositories();
    return await this.productRepository.findOne({
      where: { slug, isActive: true },
      relations: ["category"],
    });
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    await this.ensureRepositories();
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto
  ): Promise<Product | null> {
    await this.ensureRepositories();
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
    });

    if (!product) {
      return null;
    }

    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  async deleteProduct(id: string): Promise<boolean> {
    await this.ensureRepositories();
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
    });

    if (!product) {
      return false;
    }

    product.isActive = false;
    await this.productRepository.save(product);
    return true;
  }

  async searchProducts(keyword: string): Promise<Product[]> {
    await this.ensureRepositories();
    return await this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .where("product.isActive = :isActive", { isActive: true })
      .andWhere("LOWER(product.name) LIKE :keyword", {
        keyword: `%${keyword.toLowerCase()}%`,
      })
      .orderBy("product.createdAt", "DESC")
      .getMany();
  }

  private async ensureRepositories() {
    if (
      !this.productRepository ||
      !this.categoryRepository ||
      !this.cpuRepository ||
      !this.laptopRepository ||
      !this.pcRepository ||
      !this.ramRepository ||
      !this.gpuRepository ||
      !this.psuRepository ||
      !this.driveRepository ||
      !this.motherboardRepository ||
      !this.coolerRepository ||
      !this.caseRepository ||
      !this.monitorRepository ||
      !this.mouseRepository ||
      !this.networkCardRepository ||
      !this.headsetRepository ||
      !this.keyboardRepository
    ) {
      await this.initializeRepositories();
    }
  }
}
