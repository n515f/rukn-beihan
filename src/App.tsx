import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { LangProvider } from "@/context/LangContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext"; // تأكد من الاستيراد الصحيح
import { CurrencyProvider } from "@/context/CurrencyContext";
import { TaxProvider } from "@/context/TaxContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AccountDashboardPage from "./pages/account/AccountDashboardPage";
import OrdersPage from "./pages/account/OrdersPage";
import NotificationsPage from "./pages/account/NotificationsPage";
import ProfilePage from "./pages/account/ProfilePage";
import AddressesPage from "./pages/account/AddressesPage";
import SettingsPage from "./pages/account/SettingsPage";
import AccountReviewsPage from "./pages/account/AccountReviewsPage";
import OrderTrackingPage from "./pages/account/OrderTrackingPage";
import OffersPage from "./pages/OffersPage";
import SupportChatPage from "./pages/SupportChatPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminProductEditPage from "./pages/admin/AdminProductEditPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminOrderDetailsPage from "./pages/admin/AdminOrderDetailsPage";
import AdminBannersPage from "./pages/admin/AdminBannersPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminAdsPage from "./pages/admin/AdminAdsPage";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";
import AdmincategoriesPage from "./pages/admin/AdmincategoriesPage";
import AdminbrandsPage from "./pages/admin/AdminbrandsPage";
import AdminMessagePage from "./pages/admin/AdminMessagePage";
import AdminSupportInboxPage from "./pages/admin/AdminSupportInboxPage";
import OrderDetailsPage from "./pages/account/OrderDetailsPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import NotFound from "./pages/NotFound";
import SmartAssistant from "./components/ai/SmartAssistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LangProvider>
        <CurrencyProvider>
          <TaxProvider>
            <AuthProvider>
              <CartProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      {/* Public routes with Header/Footer */}
                      <Route path="/" element={<><Header /><main className="flex-1 min-h-screen"><HomePage /></main><Footer /><SmartAssistant /></>} />
                      <Route path="/catalog" element={<><Header /><main className="flex-1 min-h-screen"><CatalogPage /></main><Footer /><SmartAssistant /></>} />
                      <Route path="/product/:id" element={<><Header /><main className="flex-1 min-h-screen"><ProductDetailPage /></main><Footer /><SmartAssistant /></>} />
                      <Route path="/cart" element={<><Header /><main className="flex-1 min-h-screen"><CartPage /></main><Footer /><SmartAssistant /></>} />
                      <Route path="/checkout" element={<><Header /><main className="flex-1 min-h-screen"><CheckoutPage /></main><Footer /><SmartAssistant /></>} />
                      <Route path="/order-success/:id" element={<><Header /><main className="flex-1 min-h-screen"><OrderSuccessPage /></main><Footer /><SmartAssistant /></>} />
                      <Route path="/offers" element={<><Header /><main className="flex-1 min-h-screen"><OffersPage /></main><Footer /><SmartAssistant /></>} />
                      <Route path="/support" element={<><Header /><main className="flex-1 min-h-screen"><SupportChatPage /></main><Footer /><SmartAssistant /></>} />
                      <Route path="/auth/login" element={<><Header /><main className="flex-1 min-h-screen"><LoginPage /></main><Footer /></>} />
                      <Route path="/auth/register" element={<><Header /><main className="flex-1 min-h-screen"><RegisterPage /></main><Footer /></>} />
                      <Route path="/account" element={<><Header /><main className="flex-1 min-h-screen"><AccountDashboardPage /></main><Footer /><SmartAssistant /></>} />
                      <Route path="/account/orders" element={<><Header /><main className="flex-1 min-h-screen"><OrdersPage /></main><Footer /><SmartAssistant /></>} />
                      <Route path="/account/orders/:id" element={<><Header /><main className="flex-1 min-h-screen"><OrderDetailsPage /></main><Footer /><SmartAssistant /></>} />
                      <Route path="/account/notifications" element={<><Header /><main className="flex-1 min-h-screen"><NotificationsPage /></main><Footer /><SmartAssistant /></>} />
                      <Route path="/account/profile" element={<><Header /><main className="flex-1 min-h-screen"><ProfilePage /></main><Footer /><SmartAssistant /></>} />
                      <Route path="/account/addresses" element={<><Header /><main className="flex-1 min-h-screen"><AddressesPage /></main><Footer /><SmartAssistant /></>} />
                      <Route path="/account/settings" element={<><Header /><main className="flex-1 min-h-screen"><SettingsPage /></main><Footer /><SmartAssistant /></>} />
                      <Route path="/account/reviews" element={<><Header /><main className="flex-1 min-h-screen"><AccountReviewsPage /></main><Footer /><SmartAssistant /></>} />
                      <Route path="/account/tracking/:id" element={<><Header /><main className="flex-1 min-h-screen"><OrderTrackingPage /></main><Footer /><SmartAssistant /></>} />
                      
                      {/* Admin routes - no Header/Footer, uses AdminLayout */}
                      <Route path="/admin" element={<AdminDashboardPage />} />
                      <Route path="/admin/products" element={<AdminProductsPage />} />
                      <Route path="/admin/products/new" element={<AdminProductEditPage />} />
                      <Route path="/admin/products/:id" element={<AdminProductEditPage />} />
                      <Route path="/admin/orders" element={<AdminOrdersPage />} />
                      <Route path="/admin/orders/:id" element={<AdminOrderDetailsPage />} />
                      <Route path="/admin/banners" element={<AdminBannersPage />} />
                      <Route path="/admin/ads" element={<AdminAdsPage />} />
                      <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
                      <Route path="/admin/messages" element={<AdminMessagePage />} />
                      <Route path="/admin/support-inbox" element={<AdminSupportInboxPage />} />
                      <Route path="/admin/users" element={<AdminUsersPage />} />
                      <Route path="/admin/reviews" element={<AdminReviewsPage />} />
                      <Route path="/admin/settings" element={<AdminSettingsPage />} />
                      <Route path="/admin/categories" element={<AdmincategoriesPage />} />
                      <Route path="/admin/brands" element={<AdminbrandsPage />} />
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </CartProvider>
            </AuthProvider>
          </TaxProvider>
        </CurrencyProvider>
      </LangProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
