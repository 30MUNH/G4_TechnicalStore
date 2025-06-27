
import { Controller, Get, Param, QueryParam, Post, Put, Delete, Body } from "routing-controllers";

import { Service } from "typedi";
import { ProductService } from "./product.service";
import { Container } from "typedi";
import { CreateProductDto, UpdateProductDto } from "./dtos/product.dto";

@Service()
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

  @Get("/search")
  async searchProducts(@QueryParam("q") keyword: string) {
    if (!keyword || keyword.trim() === "") {
      return {
        success: false,
        message: "Missing search keyword"
      };
    }
    try {
      const products = await this.productService.searchProducts(keyword);
      return {
        success: true,
        data: products,
        message: "Products search result"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to search products",
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

  @Post("/")
  async createProduct(@Body() createProductDto: CreateProductDto) {
    try {
      const product = await this.productService.createProduct(createProductDto);
      return {
        success: true,
        data: product,
        message: "Product created successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to create product",
        error: error.message || "Unknown error"
      };
    }
  }

  @Put("/:id")
  async updateProduct(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto
  ) {
    try {
      const product = await this.productService.updateProduct(id, updateProductDto);
      if (!product) {
        return {
          success: false,
          message: "Product not found"
        };
      }
      return {
        success: true,
        data: product,
        message: "Product updated successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to update product",
        error: error.message || "Unknown error"
      };
    }
  }

  @Delete("/:id")
  async deleteProduct(@Param("id") id: string) {
    try {
      const result = await this.productService.deleteProduct(id);
      if (!result) {
        return {
          success: false,
          message: "Product not found"
        };
      }
      return { 
        success: true, 
        message: "Product deleted successfully" 
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to delete product",
        error: error.message || "Unknown error"
      };
    }
  }
} 