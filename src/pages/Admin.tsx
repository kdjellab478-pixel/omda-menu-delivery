import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LogOut, Plus, Trash2 } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  name_ar: string | null;
  name_fr: string | null;
  description: string | null;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  name_ar: string | null;
  name_fr: string | null;
}

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        const { data: adminData } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", session.user.id)
          .single();
        
        if (adminData) {
          setIsAdmin(true);
          loadData();
        } else {
          toast({
            title: "Access Denied",
            description: "You are not authorized to access this page",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    const [restaurantsRes, categoriesRes] = await Promise.all([
      supabase.from("restaurants").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("display_order", { ascending: true }),
    ]);

    if (restaurantsRes.data) setRestaurants(restaurantsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: adminData } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", data.user.id)
          .single();

        if (adminData) {
          setUser(data.user);
          setIsAdmin(true);
          loadData();
          toast({
            title: "Welcome!",
            description: "Successfully logged in",
          });
        } else {
          await supabase.auth.signOut();
          throw new Error("Not authorized");
        }
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    navigate("/");
  };

  const handleAddRestaurant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase.from("restaurants").insert({
        name: formData.get("name") as string,
        name_ar: formData.get("name_ar") as string,
        name_fr: formData.get("name_fr") as string,
        description: formData.get("description") as string,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Restaurant added" });
      loadData();
      e.currentTarget.reset();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleAddDish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase.from("dishes").insert({
        restaurant_id: formData.get("restaurant_id") as string,
        category_id: formData.get("category_id") as string,
        name: formData.get("name") as string,
        name_ar: formData.get("name_ar") as string,
        name_fr: formData.get("name_fr") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        image_url: formData.get("image_url") as string || null,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Dish added" });
      e.currentTarget.reset();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Sign in to manage 3omda Delivre</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold text-primary">3omda Delivre Admin</h1>
          <Button variant="ghost" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <Tabs defaultValue="restaurants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="dishes">Dishes</TabsTrigger>
          </TabsList>

          <TabsContent value="restaurants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Restaurant</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddRestaurant} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name (English)</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name_ar">Name (Arabic)</Label>
                      <Input id="name_ar" name="name_ar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name_fr">Name (French)</Label>
                      <Input id="name_fr" name="name_fr" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" />
                  </div>
                  <Button type="submit" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Restaurant
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Restaurants ({restaurants.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {restaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div>
                        <p className="font-semibold">{restaurant.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {restaurant.name_ar} | {restaurant.name_fr}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dishes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Dish</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddDish} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="restaurant_id">Restaurant</Label>
                      <Select name="restaurant_id" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select restaurant" />
                        </SelectTrigger>
                        <SelectContent>
                          {restaurants.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category_id">Category</Label>
                      <Select name="category_id" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="dish_name">Name (English)</Label>
                      <Input id="dish_name" name="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dish_name_ar">Name (Arabic)</Label>
                      <Input id="dish_name_ar" name="name_ar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dish_name_fr">Name (French)</Label>
                      <Input id="dish_name_fr" name="name_fr" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dish_description">Description</Label>
                    <Textarea id="dish_description" name="description" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (DA)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image_url">Image URL (optional)</Label>
                      <Input id="image_url" name="image_url" type="url" />
                    </div>
                  </div>
                  <Button type="submit" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Dish
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;