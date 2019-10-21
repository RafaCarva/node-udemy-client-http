import { ProductsService } from "./products.service";
import { Component } from "@angular/core";
import { Observer, Observable } from "rxjs";
import { Product } from "./product.model";
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { MaterialModule } from './material.module';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  simpleReqProductObs$: Observable<Product[]>;
  productsErrorHandling: Product[];
  productsLoading: Product[];
  isLoading: boolean = false;
  productsIds: Product[];
  newlyProducts: Product[] = [];
  productsToDelete: Product[] = [];

  constructor(private productsService: ProductsService,
    private snackBar: MatSnackBar) {}

  ngOnInit() {}

  getSimpleHttpRequest() {
    this.simpleReqProductObs$ = this.productsService.getProdutos();
  }
  getProductsWithErrorHandling() {
    this.productsService.getProdutosError()
    .subscribe(
      (prods) => {
        this.productsErrorHandling = prods; },
      (err) => {
        console.log(err);
        console.log('Message: ' + err.error.msg);
        console.log('Status code: ' + err.status);
        const config = new MatSnackBarConfig();
        config.duration = 2000;
        config.panelClass = ['snack_err']; // snack_err é a classe no style.css
        if (err.status === 0) { // Quando está offline o status code é 0.
          this.snackBar.open('Could not connect to the server', '', config);
        }
        else {
          this.snackBar.open(err.error.msg, '', config);
        }
      }
    );
  }
  getProductsWithErrorHandlingOK() {
    this.productsService.getProdutosDelay()
    .subscribe(
      (prods) => {
        this.productsErrorHandling = prods;
        let config = new MatSnackBarConfig();
        config.duration = 2000;
        config.panelClass = ['snack_ok']; // snack_ok é a classe no style.css
        this.snackBar.open('Products Successefuly loaded!', '', config);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getProductsLoading(){
    this.isLoading = true;
    this.productsService.getProdutosDelay()
    .subscribe(
      (prods) => {
        this.productsLoading = prods;
        this.isLoading = false;
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );
  }

  getProductsIds() {
    this.productsService.getProductIds()
      .subscribe((ids) => {
        this.productsIds = ids.map(id => ({_id: id, name: '', department: '', price: 0}));
      });
  }

  loadName(id: string) {
    this.productsService.getProductName(id)
      .subscribe( name => {
        let index = this.productsIds.findIndex(p => p._id === id);
        if (index >= 0){
          this.productsIds[index].name = name;
        }
      }

      );
  }

  saveProduct(name: string, department: string, price: number) {
    let p = {name, department, price};
    this.productsService.saveProduct(p)
      .subscribe(
        (p:Product) => {
          console.log(p);
          this.newlyProducts.push(p);
        },
        (err) => {
          console.log(err);
          let config = new MatSnackBarConfig();
          config.duration = 2000;
          config.panelClass = ['snack_err'];
          if (err.status === 0)
            this.snackBar.open('Could not connect to the server','',config);
          else
            this.snackBar.open(err.error.msg,'',config);
        }
      );
  }

  loadProductsToDelete() {
    this.productsService.getProdutos()
      .subscribe((prods) => this.productsToDelete = prods);
  }

  deleteProduct(p:Product){
    this.productsService.deleteProduct(p)
      .subscribe(
        (res) =>{
          let i = this.productsToDelete.findIndex(prod => p._id === prod._id);
          if (i>=0)
            this.productsToDelete.splice(i,1);
        },
        (err) => {
          console.log(err);
        }
      );
  }
}
