import { Request, Response } from "express";
import { ProductService } from "../services/productService";

export class ProductController {
  private productService = new ProductService();

  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await this.productService.getAllProducts();
      res.json(products);
    } catch (error: any) {
      // Error fetching products
      res.status(500).json({ error: "Failed to fetch products", details: error.message });
    }
  }

  async getExistingSKUs(req: Request, res: Response): Promise<void> {
    try {
      const skus = await this.productService.getExistingSKUs();
      res.json(skus);
    } catch (error: any) {
      // Error fetching SKUs
      res.status(500).json({ error: "Failed to fetch SKUs", details: error.message });
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const product = await this.productService.getProductById(req.params.id);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      res.json(product);
    } catch (error: any) {
      // Error fetching product
      res.status(500).json({ error: "Failed to fetch product", details: error.message });
    }
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const images: string[] = [];
      
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        for (const file of req.files) {
          try {
            const imageUrl = await this.productService.uploadImageToSupabase(file);
            images.push(imageUrl);
          } catch (uploadError) {
            // Image upload failed
            // Continue with other images
          }
        }
      }

      const productData = {
        ...req.body,
        price: parseFloat(req.body.price),
        images
      };

      const product = await this.productService.createProduct(productData);
      res.status(201).json(product);
    } catch (error: any) {
      // Error creating product
      
      // Check for duplicate SKU error (PostgreSQL unique violation)
      if (error.code === '23505' || (error.detail && error.detail.includes('sku'))) {
        res.status(400).json({ error: "SKU already exists. Please use a unique SKU." });
      } else {
        res.status(500).json({ error: "Failed to create product", details: error.message });
      }
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const existingProduct = await this.productService.getProductById(id);
      
      if (!existingProduct) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      let images = existingProduct.images || [];
      
      // Handle new image uploads
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          const imageUrl = await this.productService.uploadImageToSupabase(file);
          images.push(imageUrl);
        }
      }

      // Handle image deletions
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
      // Error updating product
      
      // Check for duplicate SKU error
      if (error.code === '23505' && error.detail?.includes('sku')) {
        res.status(400).json({ error: "SKU already exists. Please use a unique SKU." });
      } else {
        res.status(500).json({ error: "Failed to update product", details: error.message });
      }
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const success = await this.productService.deleteProduct(req.params.id);
      if (!success) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      res.status(204).send();
    } catch (error: any) {
      // Error deleting product
      res.status(500).json({ error: "Failed to delete product", details: error.message });
    }
  }
}