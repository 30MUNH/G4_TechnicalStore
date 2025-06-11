import { Service } from "typedi";
import { Product } from "./product.entity";
import { CreateProductDto, UpdateProductDto } from "./dtos/product.dto";
import { EntityNotFoundException, HttpException } from "@/exceptions/http-exceptions";

@Service()
export class ProductService {
    async createProduct(request: CreateProductDto): Promise<Product> {
        const product = new Product();
        product.name = request.name;
        product.category = request.category;
        product.price = request.price;
        product.stock = request.stock;
        product.url = request.url+'';
        product.description = request.description+'';
        product.active = request.active ?? true;
        await product.save();
        return product;
    }

    async getProductById(id: string): Promise<Product> {
        const product = await Product.findOne({ where: { id } });
        if (!product) throw new EntityNotFoundException("Product");
        return product;
    }

    async getAllProducts(): Promise<Product[]> {
        return await Product.find();
    }

    async updateProduct(id: string, request: UpdateProductDto): Promise<Product> {
        const product = await Product.findOne({ where: { id } });
        if (!product) throw new EntityNotFoundException("Product");

        product.name = request.name ?? product.name;
        product.category = request.category ?? product.category;
        product.price = request.price ?? product.price;
        product.stock = request.stock ?? product.stock;
        product.url = request.url ?? product.url;
        product.description = request.description ?? product.description;
        if (request.active !== undefined) product.active = request.active;

        await product.save();
        return product;
    }

    async deleteProduct(id: string): Promise<void> {
        const product = await Product.findOne({ where: { id } });
        if (!product) throw new EntityNotFoundException("Product");

        await product.remove();
    }
}
