import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import Navbar from './app/Navbar';
import { ScrollTop } from './app/ScrollTop';
import { Footer } from './app/Footer';
import Dashboard from './Dashboard';
import {
  CategoriesList,
  AddCategoryForm,
  EditCategoryForm,
} from './features/category';
import {
  ProductsList,
  ProductsListCategory,
  AddProductForm,
  EditProductForm,
} from './features/product';
import {
  PurchasesList,
  AddPurchaseForm,
  EditPurchaseForm,
  Invoice as InvoicePurchase
} from './features/purchase';
import {
  SalesList,
  AddSaleForm,
  EditSaleForm,
  Invoice as InvoiceSale,
  InvoiceToday as InvoiceTodaySale
} from './features/sale';
import {
  SuppliersList,
  AddSupplierForm,
  EditSupplierForm,
} from './features/supplier';
import { TransfersList, AddTransferForm } from './features/transfer';

function App() {
  return (
    <>
      <div className="min-vh-100">
        <Router>
          <Navbar />
          <ScrollTop />
          <Switch>
            <Route exact path="/" render={() => <Redirect to={`/dashboard`}/>} />

            <Route exact path="/dashboard" component={Dashboard} />

            <Route exact path="/products" component={ProductsList} />
            <Route exact path="/products/category/:categoryId" component={ProductsListCategory} />
            <Route exact path="/products/create" component={AddProductForm} />
            <Route
              exact
              path="/products/:productId"
              component={EditProductForm}
            />

            <Route exact path="/categories" component={CategoriesList} />
            <Route
              exact
              path="/categories/create"
              component={AddCategoryForm}
            />
            <Route
              exact
              path="/categories/:categoryId"
              component={EditCategoryForm}
            />

            <Route exact path="/purchases" component={PurchasesList} />
            <Route exact path="/purchases/create" component={AddPurchaseForm} />
            <Route
              exact
              path="/purchases/:purchaseId"
              component={EditPurchaseForm}
            />
            <Route exact path="/purchases/invoice/:purchaseId" component={InvoicePurchase} />

            <Route exact path="/sales" component={SalesList} />
            <Route exact path="/sales/create" component={AddSaleForm} />
            <Route exact path="/sales/:saleId" component={EditSaleForm} />
            <Route exact path="/sales/invoice/:saleId" component={InvoiceSale} />

            <Route exact path="/suppliers" component={SuppliersList} />
            <Route exact path="/suppliers/create" component={AddSupplierForm} />
            <Route
              exact
              path="/suppliers/:supplierId"
              component={EditSupplierForm}
            />

            {/* <Route exact path="/transfers" component={TransfersList} />
            <Route exact path="/transfers/create" component={AddTransferForm} /> */}
          </Switch>
        </Router>
      </div>
      <Footer />
    </>
  );
}

export default App;
