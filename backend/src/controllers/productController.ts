import { Request, Response } from "express";
import { ProductService } from "../services/productService";
import { logger } from "../services/loggerService";

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
}

export class ProductController {
  private productService = new ProductService();

  async getAllProducts(req: Request, res: Response): Promise<Response | void> {
    try {
      const products = await this.productService.getAllProducts();
      res.json(products);
    } catch (error: any) {
      logger.error("Error fetching products", error);
      res.status(500).json({ error: "Failed to fetch products", details: error.message });
    }
  }

  async getExistingSKUs(req: Request, res: Response): Promise<Response | void> {
    try {
      const skus = await this.productService.getExistingSKUs();
      res.json(skus);
    } catch (error: any) {
      logger.error("Error fetching SKUs", error);
      res.status(500).json({ error: "Failed to fetch SKUs", details: error.message });
    }
  }

  async getProductById(req: Request, res: Response): Promise<Response | void> {
    try {
      const product = await this.productService.getProductById(req.params.id);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      res.json(product);
    } catch (error: any) {
      logger.error("Error fetching product", error);
      res.status(500).json({ error: "Failed to fetch product", details: error.message });
    }
  }

  async createProduct(req: Request, res: Response): Promise<Response | void> {
    try {
      const images: string[] = [];
      
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const uploadPromises = req.files.map(async (file: Express.Multer.File): Promise<UploadResult> => {
          try {
            const imageUrl = await this.productService.uploadImageToSupabase(file);
            return { success: true, url: imageUrl };
          } catch (uploadError: any) {
            return { success: false, error: uploadError.message, fileName: file.originalname };
          }
        });
        
        const results = await Promise.all(uploadPromises);
        const failedUploads = results.filter((r: UploadResult) => !r.success);
        
        if (failedUploads.length > 0 && failedUploads.length === req.files.length) {
          logger.error('All image uploads failed', failedUploads);
          res.status(400).json({ 
            error: "Failed to upload all images", 
            details: failedUploads.map((f: UploadResult) => `${f.fileName}: ${f.error}`).join(', ')
          });
          return;
        }
        
        results.forEach((result: UploadResult) => {
          if (result.success && result.url) {
            images.push(result.url);
          }
        });
      }

      const productData = {
        ...req.body,
        price: parseFloat(req.body.price),
        images
      };

      const product = await this.productService.createProduct(productData);
      res.status(201).json(product);
    } catch (error: any) {
      logger.error("Error creating product", error);
      
      if (error.code === '23505' || (error.detail && error.detail.includes('sku'))) {
        res.status(400).json({ error: "SKU already exists. Please use a unique SKU." });
      } else {
        res.status(500).json({ error: "Failed to create product", details: error.message });
      }
    }
  }

  async updateProduct(req: Request, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params;
      const existingProduct = await this.productService.getProductById(id);
      
      if (!existingProduct) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      let images = existingProduct.images || [];
      
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const uploadPromises = req.files.map(async (file: Express.Multer.File): Promise<UploadResult> => {
          try {
            const imageUrl = await this.productService.uploadImageToSupabase(file);
            return { success: true, url: imageUrl };
          } catch (uploadError: any) {
            return { success: false, error: uploadError.message, fileName: file.originalname };
          }
        });
        
        const results = await Promise.all(uploadPromises);
        const successfulUploads = results.filter((r: UploadResult) => r.success);
        
        if (successfulUploads.length === 0) {
          res.status(400).json({ 
            error: "Failed to upload images", 
            details: "All image uploads failed. Please try again."
          });
          return;
        }
        
        successfulUploads.forEach((result: UploadResult) => {
          if (result.url) {
            images.push(result.url);
          }
        });
      }

      if (req.body.imagesToDelete) {
        const imagesToDelete = JSON.parse(req.body.imagesToDelete);
        for (const imageUrl of imagesToDelete) {
          const fileName = imageUrl.split('/').pop();
          if (fileName) {
            await this.productService.deleteImageFromSupabase(fileName);
          }
        }
        images = images.filter(img => !imagesToDelete.includes(img));
      }

      const productData = {
        ...req.body,
        price: req.body.price ? parseFloat(req.body.price) : existingProduct.price,
        images
      };

      delete productData.imagesToDelete;

      const product = await this.productService.updateProduct(id, productData);
      res.json(product);
    } catch (error: any) {
      logger.error("Error updating product", error);
      
      if (error.code === '23505' && error.detail?.includes('sku')) {
        res.status(400).json({ error: "SKU already exists. Please use a unique SKU." });
      } else {
        res.status(500).json({ error: "Failed to update product", details: error.message });
      }
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<Response | void> {
    try {
      const success = await this.productService.deleteProduct(req.params.id);
      if (!success) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      res.status(204).send();
    } catch (error: any) {
      logger.error("Error deleting product", error);
      res.status(500).json({ error: "Failed to delete product", details: error.message });
    }
  }
}