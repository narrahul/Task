import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css', './product-list-responsive.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  showForm = false;
  selectedProduct: Product | null = null;
  showImageModal = false;
  modalImages: string[] = [];
  currentImageIndex = 0;
  successMessage = '';
  showSuccess = false;
  isLoading = false;
  isDeleting = false;
  deletingId: string | null = null;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe(
      (data) => {
        this.products = data;
      },
      (error) => {
        // Handle error silently or show user-friendly message
      }
    );
  }

  addProduct(): void {
    this.selectedProduct = null;
    this.showForm = true;
  }

  editProduct(product: Product): void {
    this.selectedProduct = product;
    this.showForm = true;
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.isDeleting = true;
      this.deletingId = id;
      this.productService.deleteProduct(id).subscribe(
        () => {
          // Wait for product list to refresh before showing success message
          this.loadProductsAfterDelete(() => {
            this.isDeleting = false;
            this.deletingId = null;
            this.showSuccessMessage('Product deleted successfully!');
          });
        },
        (error) => {
          this.isDeleting = false;
          this.deletingId = null;
          alert('Failed to delete product. Please try again.');
        }
      );
    }
  }

  private loadProductsAfterDelete(callback: () => void): void {
    this.productService.getAllProducts().subscribe(
      (data) => {
        this.products = data;
        callback();
      },
      (error) => {
        callback();
      }
    );
  }

  onFormClose(success: boolean = false): void {
    const wasUpdate = this.selectedProduct !== null;
    this.showForm = false;
    this.selectedProduct = null;
    this.loadProducts();
    
    // Show success message if product was created/updated
    if (success) {
      if (wasUpdate) {
        this.showSuccessMessage('Product updated successfully!');
      } else {
        this.showSuccessMessage('Product created successfully!');
      }
    }
  }

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);
  }

  openImageModal(images: string[]): void {
    this.modalImages = images;
    this.currentImageIndex = 0;
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.modalImages = [];
  }

  nextImage(): void {
    if (this.currentImageIndex < this.modalImages.length - 1) {
      this.currentImageIndex++;
    }
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }
}
