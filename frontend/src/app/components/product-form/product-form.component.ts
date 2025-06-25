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
      sku: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9-_]+$/)]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      price: ['', [Validators.required, Validators.min(0), Validators.max(9999999)]]
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
    
    this.productService.getExistingSKUs().subscribe(
      (skus) => {
        this.existingSKUs = skus;
      },
      (error) => {
      }
    );
  }

  async onFileSelect(event: any): Promise<void> {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > 1024 * 1024) {
        const compressedFile = await this.compressImage(file);
        this.selectedFiles.push(compressedFile);
        
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(compressedFile);
      } else {
        this.selectedFiles.push(file);
        
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  private compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          let width = img.width;
          let height = img.height;
          const maxSize = 1200;
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            const compressedFile = new File([blob!], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          }, 'image/jpeg', 0.85);
        };
      };
    });
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
      this.errorMessage = '';
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
