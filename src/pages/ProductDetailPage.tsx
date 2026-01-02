import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, ShoppingCart, Shield, Truck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductGrid from "@/components/product/ProductGrid";
import ProductReviews from "@/components/product/ProductReviews";
import { getProductById, getProducts, Product } from "@/services/productsService";
import { useCart } from "@/context/CartContext";
import { useLang } from "@/context/LangContext";
import { useCurrency } from "@/context/CurrencyContext";
import { toast } from "sonner";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { t, lang } = useLang();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const [productData, allProducts] = await Promise.all([
          getProductById(id),
          getProducts(),
        ]);

        setProduct(productData);

        if (productData) {
          const similar = allProducts
            .filter((p) => p.categoryId === productData.categoryId && p.id !== productData.id)
            .slice(0, 4);

          setRecommended(similar);
        } else {
          setRecommended([]);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
        setRecommended([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const discount = useMemo(() => {
    if (!product?.oldPrice) return 0;
    return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
  }, [product]);

  const displayName = product ? (lang === 'ar' ? (product.nameAr || product.name) : product.name) : '';
  const displayDescription = product ? (lang === 'ar' ? (product.descriptionAr || product.description) : product.description) : '';

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      id: product.id,
      name: displayName,
      price: product.price,
      image: product.image,
      brand: product.brand,
    });

    toast.success(t("cart.added"));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{t("productDetail.productNotFound")}</h1>
        <Button asChild>
          <Link to="/catalog">{t("productDetail.backToCatalog")}</Link>
        </Button>
      </div>
    );
  }

  const warranty = product.specifications?.warranty ?? t("productDetail.warranty");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link to="/catalog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("productDetail.backToCatalog")}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <div className="aspect-square overflow-hidden rounded-lg bg-muted mb-4">
            <img src={product.image} alt={displayName} className="h-full w-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer hover-lift"
              >
                <img
                  src={product.image}
                  alt={`${displayName} ${i}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.bestSeller && <Badge>{t("productDetail.bestSeller")}</Badge>}
              {product.isNew && <Badge variant="secondary">{t("productDetail.new")}</Badge>}
              {discount > 0 && <Badge variant="destructive">-{discount}%</Badge>}
            </div>

            <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
            <p className="text-muted-foreground">{product.brand}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="font-medium">{product.rating}</span>
            <span className="text-muted-foreground">
              ({product.reviews} {t("productDetail.reviews")})
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-2xl text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          <div>
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">
                {t("products.inStock")} ({product.stock} {t("productDetail.available")})
              </span>
            ) : (
              <span className="text-destructive font-medium">{t("products.outOfStock")}</span>
            )}
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {t("products.addToCart")}
          </Button>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="text-center p-4">
              <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">{warranty}</p>
              <p className="text-xs text-muted-foreground">{t("productDetail.warranty")}</p>
            </div>

            <div className="text-center p-4">
              <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">{t("features.freeDelivery")}</p>
              <p className="text-xs text-muted-foreground">{t("features.daysDelivery")}</p>
            </div>

            <div className="text-center p-4">
              <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">{t("features.securePayment")}</p>
              <p className="text-xs text-muted-foreground">{t("features.safePayment")}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="description" className="mb-16">
        <TabsList>
          <TabsTrigger value="description">{t("productDetail.description")}</TabsTrigger>
          <TabsTrigger value="specifications">{t("productDetail.specifications")}</TabsTrigger>
          <TabsTrigger value="reviews">{t("productDetail.reviewsTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <p className="text-muted-foreground leading-relaxed">{displayDescription}</p>

          {product.features?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">{t("productDetail.keyFeatures")}</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="specifications" className="mt-6">
          {Object.keys(product.specifications ?? {}).length === 0 ? (
            <p className="text-muted-foreground">{t("common.noData")}</p>
          ) : (
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b pb-2">
                  <dt className="font-medium capitalize">{key}:</dt>
                  <dd className="text-muted-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <ProductReviews productId={product.id} />
        </TabsContent>
      </Tabs>

      {/* Recommended products */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{t("productDetail.recommended")}</h2>
        <ProductGrid products={recommended} />
      </div>
    </div>
  );
};

export default ProductDetailPage;
