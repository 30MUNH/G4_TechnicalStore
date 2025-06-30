import { Service } from "typedi";
import { Product } from "./product.entity";
import { Category } from "./categories/category.entity";
import { CreateProductDto, UpdateProductDto } from "./dtos/product.dto";
import { EntityNotFoundException, BadRequestException } from "@/exceptions/http-exceptions";
import { Like, getManager, Not, In, MoreThan } from "typeorm";

@Service()
export class ProductService {

  private async getCategoryById(id: string): Promise<Category> {
    const category = await Category.findOne({ where: { id } });
    if (!category) {
      throw new EntityNotFoundException(`Category with id '${id}' not found`);
    }
    return category;
  }

  private async getCategoryByName(name: string): Promise<Category> {
    const category = await Category.findOne({ where: { name } });
    if (!category) {
      throw new EntityNotFoundException(`Category with name '${name}' not found`);
    }
    return category;
  }

  private async getCategoriesByIds(ids: string[]): Promise<Category[]> {
    const categories = await Category.find({ where: { id: In(ids) } });
    if (categories.length !== ids.length) {
      const foundIds = categories.map(cat => cat.id);
      const missingIds = ids.filter(id => !foundIds.includes(id));
      throw new EntityNotFoundException(`Categories not found: ${missingIds.join(', ')}`);
    }
    return categories;
  }

  private async getCategoriesByNames(names: string[]): Promise<Category[]> {
    const categories = await Category.find({ 
      where: { name: In(names) }
    });
    if (categories.length !== names.length) {
      const foundNames = categories.map(cat => cat.name).filter(Boolean);
      const missingNames = names.filter(name => !foundNames.includes(name));
      throw new EntityNotFoundException(`Categories not found: ${missingNames.join(', ')}`);
    }
    return categories;
  }

  async getAllProducts(): Promise<Product[]> {
    return await Product.find({
      where: { 
        isActive: true,
        stock: MoreThan(0)
      },
      relations: ["category"],
      order: { createdAt: "DESC" },
    });
  }

  async getNewLaptops(limit: number = 8): Promise<Product[]> {
    // Truy vấn category Laptop theo tên chính xác
    const laptopCategory = await this.getCategoryByName('Laptop');
    
    return await Product.find({
      where: {
        isActive: true,
        stock: MoreThan(0),
        categoryId: laptopCategory.id,
      },
      relations: ["category"],
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  async getNewPCs(limit: number = 8): Promise<Product[]> {
    // Truy vấn category PC theo tên chính xác
    const pcCategory = await this.getCategoryByName('PC');
    
    return await Product.find({
      where: {
        isActive: true,
        stock: MoreThan(0),
        categoryId: pcCategory.id,
      },
      relations: ["category"],
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  async getNewAccessories(limit: number = 8): Promise<Product[]> {
    // Truy vấn categories Laptop và PC theo tên chính xác để loại trừ
    const [laptopCategory, pcCategory] = await this.getCategoriesByNames(['Laptop', 'PC']);
    
    return await Product
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .where("product.isActive = :isActive", { isActive: true })
      .andWhere("product.stock > :stock", { stock: 0 })
      .andWhere("product.categoryId NOT IN (:...ids)", {
        ids: [laptopCategory.id, pcCategory.id],
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
    return await Product.find({
      where: { 
        isActive: true,
        stock: MoreThan(0)
      },
      relations: ["category"],
      order: { stock: "DESC" },
      take: limit,
    });
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    await this.getCategoryById(categoryId); // Validate category exists

    return await Product.find({
      where: {
        isActive: true,
        stock: MoreThan(0),
        categoryId: categoryId
      },
      relations: ["category"],
      order: { createdAt: "DESC" }
    });
  }

  async getProductById(id: string): Promise<any | null> {
    const product = await Product.findOne({
      where: { 
        id, 
        isActive: true,
        stock: MoreThan(0)
      },
      relations: ["category"],
    });
    
    if (!product) {
      throw new EntityNotFoundException('Product not found or out of stock');
    }

    let detail = null;
    const categoryId = product.categoryId;
    
    if (!categoryId) {
      throw new BadRequestException('Product category not found');
    }

    // Lấy category để xác định loại component
    const category = await Category.findOne({ where: { id: categoryId } });
    if (!category || !category.name) {
      throw new BadRequestException('Product category not found');
    }

    // Import các component entities khi cần dựa trên category name chính xác
    switch (category.name) {
      case 'CPU':
        const { CPU } = await import("./components/cpu.entity");
        detail = await CPU.findOne({
          where: { product: { id } },
          relations: ["product"]
        });
        break;
      case 'Laptop':
        const { Laptop } = await import("./components/laptop/laptop.entity");
        detail = await Laptop.findOne({
          where: { product: { id } },
          relations: ["product"]
        });
        break;
      case 'PC':
        const { PC } = await import("./components/pc.entity");
        detail = await PC.findOne({
          where: { product: { id } },
          relations: ["product"]
        });
        break;
      case 'RAM':
        const { RAM } = await import("./components/ram.entity");
        detail = await RAM.findOne({
          where: { product: { id } },
          relations: ["product"]
        });
        break;
      case 'GPU':
        const { GPU } = await import("./components/gpu.entity");
        detail = await GPU.findOne({
          where: { product: { id } },
          relations: ["product"]
        });
        break;
      case 'PSU':
        const { PSU } = await import("./components/psu.entity");
        detail = await PSU.findOne({
          where: { product: { id } },
          relations: ["product"]
        });
        break;
      case 'Drive':
        const { Drive } = await import("./components/drive.entity");
        detail = await Drive.findOne({
          where: { product: { id } },
          relations: ["product"]
        });
        break;
      case 'Motherboard':
        const { Motherboard } = await import("./components/motherboard.entity");
        detail = await Motherboard.findOne({
          where: { product: { id } },
          relations: ["product"]
        });
        break;
      case 'Cooler':
        const { Cooler } = await import("./components/cooler.entity");
        detail = await Cooler.findOne({
          where: { product: { id } },
          relations: ["product"]
        });
        break;
      case 'Case':
        const { Case } = await import("./components/case.entity");
        detail = await Case.findOne({
          where: { product: { id } },
          relations: ["product"]
        });
        break;
      case 'Monitor':
        const { Monitor } = await import("./components/monitor.entity");
        detail = await Monitor.findOne({
          where: { product: { id } },
          relations: ["product"]
        });
        break;
      case 'Mouse':
        const { Mouse } = await import("./components/mouse.entity");
        detail = await Mouse.findOne({
          where: { product: { id } },
          relations: ["product"]
        });
        break;
      case 'Network Card':
        const { NetworkCard } = await import("./components/networkCard.entity");
        detail = await NetworkCard.findOne({
          where: { product: { id } },
          relations: ["product"]
        });
        break;
      case 'Headset':
        const { Headset } = await import("./components/headset.entity");
        detail = await Headset.findOne({
          where: { product: { id } },
          relations: ["product"]
        });
        break;
      case 'Keyboard':
        const { Keyboard } = await import("./components/keyboard.entity");
        detail = await Keyboard.findOne({
          where: { product: { id } },
          relations: ["product"]
        });
        break;
    }

    // Nếu có detail, gộp các trường chi tiết vào product (bỏ các trường không cần thiết)
    if (detail) {
      const { id, createdAt, updatedAt, product: _prod, ...fields } = detail;
      Object.assign(product, fields);
    }

    return product;
  }

  async getProductByName(name: string): Promise<Product | null> {
    return await Product.findOne({
      where: { 
        name, 
        isActive: true,
        stock: MoreThan(0)
      },
      relations: ["category"],
    });
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    return getManager().transaction(async transactionalEntityManager => {
      // Validate category exists
      const category = await Category.findOne({ where: { id: createProductDto.categoryId } });
      if (!category) {
        throw new EntityNotFoundException('Category');
      }

      // Validate price and stock
      if (createProductDto.price <= 0) {
        throw new BadRequestException('Price must be greater than 0');
      }

      if (createProductDto.stock < 0) {
        throw new BadRequestException('Stock cannot be negative');
      }

      // Check if product with same name already exists
      const existingProduct = await Product.findOne({
        where: { name: createProductDto.name }
      });

      if (existingProduct) {
        throw new BadRequestException('Product with this name already exists');
      }

      const product = new Product();
      Object.assign(product, createProductDto);
      product.isActive = createProductDto.isActive ?? true;
      
      return await transactionalEntityManager.save(product);
    });
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto
  ): Promise<Product | null> {
    return getManager().transaction(async transactionalEntityManager => {
      const product = await Product.findOne({ where: { id } });
      if (!product) {
        throw new EntityNotFoundException('Product');
      }

      // Validate category if provided
      if (updateProductDto.categoryId) {
        const category = await Category.findOne({ where: { id: updateProductDto.categoryId } });
        if (!category) {
          throw new EntityNotFoundException('Category');
        }
      }

      // Validate price if provided
      if (updateProductDto.price !== undefined && updateProductDto.price <= 0) {
        throw new BadRequestException('Price must be greater than 0');
      }

      // Validate stock if provided
      if (updateProductDto.stock !== undefined && updateProductDto.stock < 0) {
        throw new BadRequestException('Stock cannot be negative');
      }

      // Check if product with same name already exists (excluding current product)
      if (updateProductDto.name) {
        const existingProduct = await Product.findOne({
          where: { name: updateProductDto.name, id: Not(id) }
        });

        if (existingProduct) {
          throw new BadRequestException('Product with this name already exists');
        }
      }

      Object.assign(product, updateProductDto);
      return await transactionalEntityManager.save(product);
    });
  }

  async deleteProduct(id: string): Promise<boolean> {
    return getManager().transaction(async transactionalEntityManager => {
      const product = await Product.findOne({ where: { id } });
      if (!product) {
        throw new EntityNotFoundException('Product');
      }

      // Soft delete by setting isActive to false
      product.isActive = false;
      await transactionalEntityManager.save(product);
      
      return true;
    });
  }

  async searchProducts(keyword: string): Promise<Product[]> {
    if (!keyword || keyword.trim() === "") {
      throw new BadRequestException('Search keyword is required');
    }

    return await Product.find({
      where: [
        { 
          name: Like(`%${keyword}%`), 
          isActive: true,
          stock: MoreThan(0)
        },
        { 
          description: Like(`%${keyword}%`), 
          isActive: true,
          stock: MoreThan(0)
        }
      ],
      relations: ["category"],
      order: { createdAt: "DESC" }
    });
  }

  // Thêm method để lấy sản phẩm theo loại category (main category)
  async getProductsByMainCategory(categoryId: string, limit: number = 8): Promise<Product[]> {
    await this.getCategoryById(categoryId); // Validate category exists
    
    return await Product.find({
      where: {
        isActive: true,
        stock: MoreThan(0),
        categoryId: categoryId
      },
      relations: ["category"],
      order: { createdAt: "DESC" },
      take: limit
    });
  }

  // Thêm method để lấy tất cả categories
  async getAllCategories(): Promise<Category[]> {
    return await Category.find({
      order: { name: "ASC" }
    });
  }

  // Thêm method để lấy sản phẩm theo nhiều categories
  async getProductsByMultipleCategories(categoryIds: string[], limit: number = 8): Promise<Product[]> {
    await this.getCategoriesByIds(categoryIds); // Validate categories exist
    
    return await Product.find({
      where: {
        isActive: true,
        stock: MoreThan(0),
        categoryId: In(categoryIds)
      },
      relations: ["category"],
      order: { createdAt: "DESC" },
      take: limit
    });
  }

  // Thêm method để lấy sản phẩm theo tên category
  async getProductsByCategoryName(categoryName: string, limit: number = 8): Promise<Product[]> {
    const category = await this.getCategoryByName(categoryName);
    
    return await Product.find({
      where: {
        isActive: true,
        stock: MoreThan(0),
        categoryId: category.id
      },
      relations: ["category"],
      order: { createdAt: "DESC" },
      take: limit
    });
  }

  // Thêm method để lấy sản phẩm theo loại (laptop, pc, accessories)
  async getProductsByType(type: 'laptop' | 'pc' | 'accessories', limit: number = 8): Promise<Product[]> {
    switch (type) {
      case 'laptop':
        return this.getNewLaptops(limit);
      case 'pc':
        return this.getNewPCs(limit);
      case 'accessories':
        return this.getNewAccessories(limit);
      default:
        throw new BadRequestException('Invalid product type. Must be laptop, pc, or accessories');
    }
  }

  // Thêm method để lấy sản phẩm theo category ID
  async getProductsByCategoryId(categoryId: string, limit: number = 8): Promise<Product[]> {
    await this.getCategoryById(categoryId); // Validate category exists
    
    return await Product.find({
      where: {
        isActive: true,
        stock: MoreThan(0),
        categoryId: categoryId
      },
      relations: ["category"],
      order: { createdAt: "DESC" },
      take: limit
    });
  }

  // Thêm method để lấy tất cả sản phẩm (bao gồm cả hết hàng) - cho admin
  async getAllProductsIncludingOutOfStock(): Promise<Product[]> {
    return await Product.find({
      where: { isActive: true },
      relations: ["category"],
      order: { createdAt: "DESC" },
    });
  }

  // Thêm method để lấy sản phẩm hết hàng
  async getOutOfStockProducts(): Promise<Product[]> {
    return await Product.find({
      where: { 
        isActive: true,
        stock: 0
      },
      relations: ["category"],
      order: { createdAt: "DESC" },
    });
  }
}
