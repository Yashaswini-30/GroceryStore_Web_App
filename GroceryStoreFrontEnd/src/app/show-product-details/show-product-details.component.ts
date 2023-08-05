import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../_model/product.model';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ShowProductImagesDialogComponent } from '../show-product-images-dialog/show-product-images-dialog.component';
import { ImageProcessingService } from '../image-processing.service';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-show-product-details',
  templateUrl: './show-product-details.component.html',
  styleUrls: ['./show-product-details.component.css']
})
export class ShowProductDetailsComponent implements OnInit{

  showLoadMoreProductButton=false;
  pageNumer:number=0;
  productDetails: Product[] = [];
  showTable=false;

  //display columns names for show details
  displayedColumns: string[] = ['Id', 'Product Name', 'description', 'Product Discounted Price', 'Product Actual Price', 'Actions'];

  constructor(private productService : ProductService,
              public imagesDialog: MatDialog,
              private imageProcessingService: ImageProcessingService,
              private router: Router,
              private _snackBar:MatSnackBar) {}

  ngOnInit(): void {
    this.getAllProducts();
  }

  public getAllProducts(searchkeyword:string="") {
    this.showTable=false;
    this.productService.getAllProducts(this.pageNumer,searchkeyword)
    .pipe(
      map((x : Product[], i) => x.map((product : Product) => this.imageProcessingService.createImages(product)))
    )
    .subscribe(
      (response : Product[] ): void => {
        console.log(response);
        
        if(response.length==4)//in one batch loading 12 pro
        {
          this.showLoadMoreProductButton=true;
        }
        else{
          this.showLoadMoreProductButton=false;
        }
        response.forEach(product=>this.productDetails.push(product));//to add new data 
        this.showTable=true;
   //     this.productDetails = response;
      },
      (error : HttpErrorResponse) =>{
        console.log(error);
      }

    );
  }

  deleteProduct(productId: any) {
    this.productService.deleteProduct(productId).subscribe(
      (response)=> {
        this.getAllProducts();
        this._snackBar.open('Product Deleted Sucessfully','Ok',{duration:3000,
          verticalPosition:'bottom',
        horizontalPosition:'right',
        panelClass: ['green-snackbar', 'login-snackbar']});
        
      },
      (error : HttpErrorResponse) =>{
        console.log(error);
      }
     
    );
  }

  showImages(product : Product){
    console.log(product);
    this.imagesDialog.open(ShowProductImagesDialogComponent, {
      data: {
        images: product.productImages
      },
      
      height: '500px',
      width: '800px'
    });
  }

  editProductDetails(productId: any) {
   
    this.router.navigate(['/addNewProduct', {productId: productId}]);
  }


  public loadMoreProduct()
  {
    this.pageNumer=this.pageNumer+1;

    this.getAllProducts();
  }


  searchByKeyword(searchkeyword: string | undefined) {
    console.log(searchkeyword);
    this.pageNumer = 0;
    this.productDetails = []; 
    this.getAllProducts(searchkeyword);
  }
}


//almost same as home but add div before table in showproductdeatilhtml
//make var show tble