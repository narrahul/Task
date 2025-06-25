import { AppDataSource } from "../config/database";
import { Product } from "../entities/Product";
import { supabase } from "../config/supabase";
import { logger } from "./loggerService";

export class ProductService {
  private productRepository = AppDataSource.getRepository(Product);

  async getExistingSKUs(): Promise<string[]> {
    const products = await this.productRepository.find({
      select: ['sku']
    });
    return products.map((p: Product) => p.sku);
  }

  async getAllProducts(): Promise<Product[]> {
    const products = await this.productRepository.find();
    
    return products.sort((a: Product, b: Product) => {
      const aNum = parseInt(a.sku.match(/\d+/)?.[0] || '0');
      const bNum = parseInt(b.sku.match(/\d+/)?.[0] || '0');
      
      if (aNum && bNum && !isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      
      return a.sku.localeCompare(b.sku, undefined, { numeric: true, sensitivity: 'base' });
    });
  }

  async getProductById(id: string): Promise<Product | null> {
    return await this.productRepository.findOneBy({ id });
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    try {
      const product = this.productRepository.create(productData);
      return await this.productRepository.save(product);
    } catch (error: any) {
      if (error.code === '23505') {
        const err = new Error('SKU already exists');
        (err as any).code = '23505';
        (err as any).detail = error.detail;
        throw err;
      }
      throw error;
    }
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product | null> {
    await this.productRepository.update(id, productData);
    return await this.getProductById(id);
  }

  async deleteProduct(id: string): Promise<boolean> {
    const product = await this.getProductById(id);
    if (!product) return false;

    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        try {
          const urlParts = imageUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          if (fileName) {
            await this.deleteImageFromSupabase(fileName);
          }
        } catch (error) {
          logger.error('Failed to delete image from storage', error);
        }
      }
    }

    const result = await this.productRepository.delete(id);
    return result.affected !== 0;
  }

  async uploadImageToSupabase(file: Express.Multer.File): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname}`;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      logger.error('Supabase upload error', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return publicUrl;
  }

  async deleteImageFromSupabase(fileName: string): Promise<void> {
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      logger.error('Supabase delete error', error);
      throw error;
    }
  }
}