// routers.js

import DiscountList from "../pages/discount/DiscountList";
import UpdateDiscount from "../pages/sellers/discount/UpdateDiscountBySeller";
import ProductList from "../pages/products/ProductList";
import AddDiscountBySeller from "../pages/sellers/discount/AddDiscountBySeller";
import SellerDiscountList from "../pages/sellers/discount/SellerDiscountList";
import SellerProductList from "../pages/sellers/products/SellerProductList";
import DashBoard from "./../pages/DashBoard";
import AddProductBySeller from "./../pages/sellers/products/AddProductBySeller";
import EditProduct from "./../pages/sellers/products/EditProduct";
import ProfileSeller from "../pages/sellers/profile/ProfileSeller";
import CategoryList from "../pages/category/CategoryList";
import AddCategory from "../pages/category/AddCategory";
import UpdateCategory from "../pages/category/UpdateCategory";
import SellerList from "../pages/seller/SellerList";
import AddSeller from "../pages/seller/AddSeller";
import UpdateSeller from "../pages/seller/UpdateSeller";
import CustomerList from "../pages/customer/CustomerList";
import PriceCategory from "../pages/category/PriceCategory";
import PostList from "../pages/post/PostList";
import PageList from "../pages/post/PageList";
import AddPage from "../pages/post/AddPages";
import UpdatePage from "../pages/post/UpdatePage";
import OrderList from "../pages/order/OrderList";
import SellerOrderList from "../pages/sellers/orders/SellerOrderList";
import SellerPostList from "./../pages/sellers/posts/SellerPostList";
import AddPost from "../pages/sellers/posts/AddPost";
import PostUpdate from "../pages/sellers/posts/PostUpdate";
import OrderDetail from "../pages/sellers/orders/OrderDetail";
import ProfileShop from "../pages/seller/ProfileShop";
import UpdateProfileShop from "../pages/sellers/profile/UpdateProfileShop";
import SendMail from "../pages/mail/SendMail";
import TemplateList from "../pages/sellers/template/TemplateList";
import AddTemplate from "../pages/sellers/template/AddTemplate";
import AddTopic from "../pages/topic/AddTopic";
import TopicList from "../pages/topic/TopicList";
import UpdateTemplate from "../pages/sellers/template/UpdateTemplate";

const routerAdmin = [
  {
    path: "dashboard", // Đường dẫn cho route
    component: DashBoard, // Component tương ứng cho route
  },
  {
    path: "products", // Đường dẫn cho route
    component: ProductList, // Component tương ứng cho route
  },

  {
    path: "discounts", // Đường dẫn cho route
    component: DiscountList, // Component tương ứng cho route
  },
  {
    path: "admin/updateDiscount/:id", // Đường dẫn cho route
    component: UpdateDiscount, // Component tương ứng cho route
  },
  {
    path: "categories", // Đường dẫn cho route
    component: CategoryList, // Component tương ứng cho route
  },
  {
    path: "addCategory", // Đường dẫn cho route
    component: AddCategory, // Component tương ứng cho route
  },
  {
    path: "updateCategory/:id", // Đường dẫn cho route
    component: UpdateCategory, // Component tương ứng cho route
  },
  {
    path: "sellers", // Đường dẫn cho route
    component: SellerList, // Component tương ứng cho route
  },
  {
    path: "addSeller", // Đường dẫn cho route
    component: AddSeller, // Component tương ứng cho route
  },
  {
    path: "updateSeller/:id", // Đường dẫn cho route
    component: UpdateSeller, // Component tương ứng cho route
  },
  {
    path: "customers", // Đường dẫn cho route
    component: CustomerList, // Component tương ứng cho route
  },
  {
    path: "addPriceCategory", // Đường dẫn cho route
    component: PriceCategory, // Component tương ứng cho route
  },
  {
    path: "posts", // Đường dẫn cho route
    component: PostList, // Component tương ứng cho route
  },
  {
    path: "pages", // Đường dẫn cho route
    component: PageList, // Component tương ứng cho route
  },
  {
    path: "addPage", // Đường dẫn cho route
    component: AddPage, // Component tương ứng cho route
  },
  {
    path: "updatePage/:id", // Đường dẫn cho route
    component: UpdatePage, // Component tương ứng cho route
  },
  {
    path: "orders", // Đường dẫn cho route
    component: OrderList, // Component tương ứng cho route
  },
  {
    path: "profile-shop/:sellerId", // Đường dẫn cho route
    component: ProfileShop, // Component tương ứng cho route
  },
  {
    path: "sendMail", // Đường dẫn cho route
    component: SendMail, // Component tương ứng cho route
  },
  {
    path: "addTopic", // Đường dẫn cho route
    component: AddTopic, // Component tương ứng cho route
  },
  {
    path: "topics", // Đường dẫn cho route
    component: TopicList, // Component tương ứng cho route
  },

  // Thêm các route khác nếu cần
];
const routerSeller = [
  {
    path: "products", // Đường dẫn cho route
    component: SellerProductList, // Component tương ứng cho route
  },
  {
    path: "addProduct", // Đường dẫn cho route
    component: AddProductBySeller, // Component tương ứng cho route
  },
  {
    path: "updateProduct/:id", // Đường dẫn cho route
    component: EditProduct, // Component tương ứng cho route
  },
  {
    path: "discounts", // Đường dẫn cho route
    component: SellerDiscountList, // Component tương ứng cho route
  },
  {
    path: "addDiscount", // Đường dẫn cho route
    component: AddDiscountBySeller, // Component tương ứng cho route
  },
  {
    path: "profile", // Đường dẫn cho route
    component: ProfileSeller, // Component tương ứng cho route
  },
  {
    path: "orders", // Đường dẫn cho route
    component: SellerOrderList, // Component tương ứng cho route
  },
  {
    path: "posts", // Đường dẫn cho route
    component: SellerPostList, // Component tương ứng cho route
  },
  {
    path: "addPost", // Đường dẫn cho route
    component: AddPost, // Component tương ứng cho route
  },
  {
    path: "updatePost/:id", // Đường dẫn cho route
    component: PostUpdate, // Component tương ứng cho route
  },
  {
    path: "orders/:id", // Đường dẫn cho route
    component: OrderDetail, // Component tương ứng cho route
  },
  {
    path: "updateProfile", // Đường dẫn cho route
    component: UpdateProfileShop, // Component tương ứng cho route
  },

  {
    path: "templates", // Đường dẫn cho route
    component: TemplateList, // Component tương ứng cho route
  },
  {
    path: "templates/add-template", // Đường dẫn cho route
    component: AddTemplate, // Component tương ứng cho route
  },
  {
    path: "templates/update-template/:id", // Đường dẫn cho route
    component: UpdateTemplate, // Component tương ứng cho route
  },
];

export { routerAdmin, routerSeller };

export default routerAdmin;
