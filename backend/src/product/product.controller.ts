import { Controller, Get, Param, QueryParam } from "routing-controllers";
import { ProductService } from "./product.service";
import { Container } from "typedi";

@Controller("/products")
export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = Container.get(ProductService);
  }

  @Get("/")
  async getAllProducts() {
    try {
      const products = await this.productService.getAllProducts();
      return {
        success: true,
        data: products,
        message: "Products retrieved successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to retrieve products",
        error: error.message || "Unknown error"
      };
    }
  }

  @Get("/new")
  async getNewProducts(@QueryParam("limit") limit: number = 8) {
    try {
      const products = await this.productService.getNewProducts(limit);
      return {
        success: true,
        data: products,
        message: "New products retrieved successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to retrieve new products",
        error: error.message || "Unknown error"
      };
    }
  }

  @Get("/top-selling")
  async getTopSellingProducts(@QueryParam("limit") limit: number = 6) {
    try {
      const products = await this.productService.getTopSellingProducts(limit);
      return {
        success: true,
        data: products,
        message: "Top selling products retrieved successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to retrieve top selling products",
        error: error.message || "Unknown error"
      };
    }
  }

  @Get("/category/:categorySlug")
  async getProductsByCategory(@Param("categorySlug") categorySlug: string) {
    try {
      const products = await this.productService.getProductsByCategory(categorySlug);
      return {
        success: true,
        data: products,
        message: "Products by category retrieved successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to retrieve products by category",
        error: error.message || "Unknown error"
      };
    }
  }

  @Get("/:id")
  async getProductById(@Param("id") id: string) {
    try {
      const product = await this.productService.getProductById(id);
      if (!product) {
        return {
          success: false,
          message: "Product not found"
        };
      }
      return {
        success: true,
        data: product,
        message: "Product retrieved successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to retrieve product",
        error: error.message || "Unknown error"
      };
    }
  }
} 