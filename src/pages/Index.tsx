import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher, Language } from "@/components/LanguageSwitcher";
import { DishCard } from "@/components/DishCard";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, UtensilsCrossed, Clock, MapPin } from "lucide-react";
import { sendWhatsAppOrder } from "@/lib/whatsapp";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/couscous-hero.jpg";
import { Link } from "react-router-dom";

interface Dish {
  id: string;
  name: string;
  name_ar: string | null;
  name_fr: string | null;
  description: string | null;
  description_ar: string | null;
  description_fr: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  restaurant_id: string;
  category_id: string | null;
  restaurants: {
    name: string;
    name_ar: string | null;
    name_fr: string | null;
  };
  categories: {
    name: string;
    name_ar: string | null;
    name_fr: string | null;
  } | null;
}

interface Category {
  id: string;
  name: string;
  name_ar: string | null;
  name_fr: string | null;
}

const Index = () => {
  const [language, setLanguage] = useState<Language>("ar");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const content = {
    ar: {
      hero: "أفضل مطاعم بوسعادة",
      subtitle: "اطلب طبقك المفضل وسنوصله إليك",
      orderNow: "اطلب الآن",
      features: "لماذا تختار عمدة ديليفري؟",
      feature1: "توصيل سريع",
      feature1Desc: "نصل إليك في أقل من 30 دقيقة",
      feature2: "طعام طازج",
      feature2Desc: "جميع الأطباق محضرة طازجة",
      feature3: "تغطية شاملة",
      feature3Desc: "نغطي جميع أحياء بوسعادة",
      menu: "قائمة الطعام",
      allCategories: "الكل",
    },
    fr: {
      hero: "Meilleurs restaurants de Bou Saada",
      subtitle: "Commandez votre plat préféré, on vous le livre",
      orderNow: "Commander maintenant",
      features: "Pourquoi choisir 3omda Delivre?",
      feature1: "Livraison rapide",
      feature1Desc: "Nous arrivons en moins de 30 minutes",
      feature2: "Nourriture fraîche",
      feature2Desc: "Tous les plats sont fraîchement préparés",
      feature3: "Couverture complète",
      feature3Desc: "Nous couvrons tous les quartiers de Bou Saada",
      menu: "Menu",
      allCategories: "Tout",
    },
    en: {
      hero: "Best Restaurants in Bou Saada",
      subtitle: "Order your favorite dish, we'll deliver it",
      orderNow: "Order Now",
      features: "Why choose 3omda Delivre?",
      feature1: "Fast Delivery",
      feature1Desc: "We arrive in less than 30 minutes",
      feature2: "Fresh Food",
      feature2Desc: "All dishes are freshly prepared",
      feature3: "Full Coverage",
      feature3Desc: "We cover all neighborhoods in Bou Saada",
      menu: "Menu",
      allCategories: "All",
    },
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dishesRes, categoriesRes] = await Promise.all([
        supabase
          .from("dishes")
          .select("*, restaurants(*), categories(*)")
          .eq("is_available", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("categories")
          .select("*")
          .order("display_order", { ascending: true }),
      ]);

      if (dishesRes.data) setDishes(dishesRes.data as any);
      if (categoriesRes.data) setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "خطأ",
        description: "فشل تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = (dish: Dish) => {
    const restaurantName = dish.restaurants.name;
    sendWhatsAppOrder(dish.name, restaurantName, dish.price);
  };

  const filteredDishes = selectedCategory
    ? dishes.filter((d) => d.category_id === selectedCategory)
    : dishes;

  const getLocalizedText = (
    en?: string | null,
    ar?: string | null,
    fr?: string | null
  ) => {
    if (language === "ar" && ar) return ar;
    if (language === "fr" && fr) return fr;
    return en || "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">3omda Delivre</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                Admin
              </Button>
            </Link>
            <LanguageSwitcher
              currentLanguage={language}
              onLanguageChange={setLanguage}
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        <img
          src={heroImage}
          alt="Hero"
          className="absolute inset-0 h-full w-full object-cover mix-blend-multiply"
        />
        <div className="container relative mx-auto px-4 py-24 text-center">
          <h2 className="mb-4 text-5xl font-bold text-white drop-shadow-lg md:text-6xl">
            {content[language].hero}
          </h2>
          <p className="mb-8 text-xl text-white/95 drop-shadow-md">
            {content[language].subtitle}
          </p>
          <Button
            size="lg"
            className="gap-2 bg-white text-primary hover:bg-white/90"
            onClick={() => {
              document
                .getElementById("menu")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <MessageCircle className="h-5 w-5" />
            {content[language].orderNow}
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border/50 bg-card py-16">
        <div className="container mx-auto px-4">
          <h3 className="mb-12 text-center text-3xl font-bold text-foreground">
            {content[language].features}
          </h3>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h4 className="mb-2 text-xl font-semibold text-foreground">
                {content[language].feature1}
              </h4>
              <p className="text-muted-foreground">
                {content[language].feature1Desc}
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <UtensilsCrossed className="h-8 w-8 text-primary" />
              </div>
              <h4 className="mb-2 text-xl font-semibold text-foreground">
                {content[language].feature2}
              </h4>
              <p className="text-muted-foreground">
                {content[language].feature2Desc}
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h4 className="mb-2 text-xl font-semibold text-foreground">
                {content[language].feature3}
              </h4>
              <p className="text-muted-foreground">
                {content[language].feature3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="mb-8 text-center text-4xl font-bold text-foreground">
            {content[language].menu}
          </h3>

          {/* Category Filters */}
          <div className="mb-8 flex flex-wrap justify-center gap-3">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
            >
              {content[language].allCategories}
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {getLocalizedText(cat.name, cat.name_ar, cat.name_fr)}
              </Button>
            ))}
          </div>

          {/* Dishes Grid */}
          {loading ? (
            <div className="text-center text-muted-foreground">
              جاري التحميل...
            </div>
          ) : filteredDishes.length === 0 ? (
            <div className="text-center text-muted-foreground">
              لا توجد أطباق متاحة حاليا
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredDishes.map((dish) => (
                <DishCard
                  key={dish.id}
                  {...dish}
                  restaurant_name={getLocalizedText(
                    dish.restaurants.name,
                    dish.restaurants.name_ar,
                    dish.restaurants.name_fr
                  )}
                  category_name={
                    dish.categories
                      ? getLocalizedText(
                          dish.categories.name,
                          dish.categories.name_ar,
                          dish.categories.name_fr
                        )
                      : undefined
                  }
                  language={language}
                  onOrder={() => handleOrder(dish)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="mb-2">© 2025 3omda Delivre - Bou Saada</p>
          <p className="text-sm">
            📱 +213 658 592 303 | +213 658 160 260
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;