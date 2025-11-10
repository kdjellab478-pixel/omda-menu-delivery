import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Language } from "./LanguageSwitcher";

interface DishCardProps {
  name: string;
  name_ar?: string | null;
  name_fr?: string | null;
  description?: string | null;
  description_ar?: string | null;
  description_fr?: string | null;
  price: number;
  image_url?: string | null;
  is_available: boolean;
  restaurant_name: string;
  category_name?: string;
  language: Language;
  onOrder: () => void;
}

export const DishCard = ({
  name,
  name_ar,
  name_fr,
  description,
  description_ar,
  description_fr,
  price,
  image_url,
  is_available,
  restaurant_name,
  category_name,
  language,
  onOrder,
}: DishCardProps) => {
  const getLocalizedText = (en?: string | null, ar?: string | null, fr?: string | null) => {
    if (language === "ar" && ar) return ar;
    if (language === "fr" && fr) return fr;
    return en || "";
  };

  const displayName = getLocalizedText(name, name_ar, name_fr);
  const displayDescription = getLocalizedText(description, description_ar, description_fr);

  const orderText = {
    ar: "اطلب الآن",
    fr: "Commander",
    en: "Order Now",
  };

  const unavailableText = {
    ar: "غير متوفر",
    fr: "Non disponible",
    en: "Unavailable",
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {image_url && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={image_url}
            alt={displayName}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-foreground">{displayName}</CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              {restaurant_name}
            </CardDescription>
          </div>
          {category_name && (
            <Badge variant="secondary" className="ml-2 shrink-0">
              {category_name}
            </Badge>
          )}
        </div>
      </CardHeader>
      {displayDescription && (
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">{displayDescription}</p>
        </CardContent>
      )}
      <CardFooter className="flex items-center justify-between">
        <div className="text-2xl font-bold text-primary">{price.toFixed(2)} DA</div>
        {is_available ? (
          <Button onClick={onOrder} className="gap-2">
            <MessageCircle className="h-4 w-4" />
            {orderText[language]}
          </Button>
        ) : (
          <Badge variant="destructive">{unavailableText[language]}</Badge>
        )}
      </CardFooter>
    </Card>
  );
};