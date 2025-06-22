import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  @Input() product: Product | null = null;
  @Output() close = new EventEmitter<boolean>();

  productForm: FormGroup;
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  existingImages: string[] = [];
  imagesToDelete: string[] = [];
  isSubmitting = false;
  errorMessage = '';
  existingSKUs: string[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {
    this.productForm = this.fb.group({
      sku: ['', Validators.required],
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    if (this.product) {
      this.productForm.patchValue({
        sku: this.product.sku,
        name: this.product.name,
        price: this.product.price
      });
      this.existingImages = [...this.product.images];
    }
    
    // Fetch existing SKUs to show as hint
    this.productService.getExistingSKUs().subscribe(
      (skus) => {
        this.existingSKUs = skus;
      },
      (error) => {
        console.error('Failed to fetch existing SKUs:', error);
      }
    );
  }

  onFileSelect(event: any): void {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.selectedFiles.push(files[i]);
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(files[i]);
    }
  }

  removeNewImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  removeExistingImage(image: string): void {
    const index = this.existingImages.indexOf(image);
    if (index > -1) {
      this.existingImages.splice(index, 1);
      this.imagesToDelete.push(image);
    }
  }

  onSubmit(): void {
    if (this.productForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = ''; // Clear previous errors
      const formData = new FormData();
      
      formData.append('sku', this.productForm.value.sku);
      formData.append('name', this.productForm.value.name);
      formData.append('price', this.productForm.value.price.toString());
      
      for (const file of this.selectedFiles) {
        formData.append('images', file);
      }

      if (this.product) {
        if (this.imagesToDelete.length > 0) {
          formData.append('imagesToDelete', JSON.stringify(this.imagesToDelete));
        }
        
        this.productService.updateProduct(this.product.id!, formData).subscribe(
          () => {
            this.close.emit(true);
          },
          (error) => {
            console.error('Error updating product:', error);
            this.isSubmitting = false;
            this.errorMessage = error.error?.error || 'Failed to update product';
          }
        );
      } else {
        this.productService.createProduct(formData).subscribe(
          () => {
            this.close.emit(true);
          },
          (error) => {
            console.error('Error creating product:', error);
            this.isSubmitting = false;
            this.errorMessage = error.error?.error || 'Failed to create product';
          }
        );
      }
    }
  }

  onCancel(): void {
    this.close.emit(false);
  }
}
