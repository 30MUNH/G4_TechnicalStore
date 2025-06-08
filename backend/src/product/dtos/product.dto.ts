export class CreateProductDto {
    name: string;
    category: string;
    price: number;
    stock: number;
    url?: string;
    active?: boolean;
}

export class UpdateProductDto {
    name?: string;
    category?: string;
    price?: number;
    stock?: number;
    url?: string;
    active?: boolean;
}
