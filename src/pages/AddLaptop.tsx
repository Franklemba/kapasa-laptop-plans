
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Laptop, ArrowLeft, Save, Loader2 } from "lucide-react";

interface LaptopForm {
  name: string;
  brand: string;
  model: string;
  processor: string;
  ram: string;
  storage: string;
  display: string;
  graphics: string;
  price: string;
  original_price: string;
  weekly_payment: string;
  condition: string;
  description: string;
  image_url: string;
  stock_quantity: string;
  min_stock_level: string;
  sku: string;
}

const AddLaptop = () => {
  const [form, setForm] = useState<LaptopForm>({
    name: "",
    brand: "",
    model: "",
    processor: "",
    ram: "",
    storage: "",
    display: "",
    graphics: "",
    price: "",
    original_price: "",
    weekly_payment: "",
    condition: "new",
    description: "",
    image_url: "",
    stock_quantity: "1",
    min_stock_level: "5",
    sku: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setForm(prev => ({ ...prev, condition: value }));
  };

  const generateSKU = () => {
    const prefix = form.brand.slice(0, 3).toUpperCase();
    const suffix = Math.random().toString(36).substr(2, 6).toUpperCase();
    const sku = `${prefix}-${suffix}`;
    setForm(prev => ({ ...prev, sku }));
  };

  const validateForm = () => {
    const requiredFields = ['name', 'brand', 'model', 'processor', 'ram', 'storage', 'display', 'price', 'weekly_payment'];
    const missingFields = requiredFields.filter(field => !form[field as keyof LaptopForm]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return false;
    }

    if (parseFloat(form.price) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Price must be greater than 0",
        variant: "destructive"
      });
      return false;
    }

    if (parseFloat(form.weekly_payment) <= 0) {
      toast({
        title: "Invalid Weekly Payment",
        description: "Weekly payment must be greater than 0",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const laptopData = {
        name: form.name,
        brand: form.brand,
        model: form.model,
        processor: form.processor,
        ram: form.ram,
        storage: form.storage,
        display: form.display,
        graphics: form.graphics || null,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        weekly_payment: parseFloat(form.weekly_payment),
        condition: form.condition,
        description: form.description || null,
        image_url: form.image_url || null,
        stock_quantity: parseInt(form.stock_quantity),
        min_stock_level: parseInt(form.min_stock_level),
        sku: form.sku || null,
        status: 'active'
      };

      const { data, error } = await supabase
        .from("laptops")
        .insert([laptopData])
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        toast({
          title: "Error",
          description: "Failed to add laptop: " + error.message,
          variant: "destructive"
        });
        return;
      }

      console.log("Laptop added successfully:", data);
      
      toast({
        title: "Success!",
        description: `${form.name} has been added to inventory`,
        variant: "default"
      });

      // Reset form
      setForm({
        name: "",
        brand: "",
        model: "",
        processor: "",
        ram: "",
        storage: "",
        display: "",
        graphics: "",
        price: "",
        original_price: "",
        weekly_payment: "",
        condition: "new",
        description: "",
        image_url: "",
        stock_quantity: "1",
        min_stock_level: "5",
        sku: ""
      });

      // Navigate back after 2 seconds
      setTimeout(() => {
        navigate("/admin");
      }, 2000);

    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b mb-6">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Laptop className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-semibold">Add New Laptop</h1>
            </div>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Laptop className="h-5 w-5" />
            Laptop Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input 
                  id="name"
                  name="name" 
                  value={form.name} 
                  placeholder="e.g., MacBook Pro 16-inch"
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input 
                  id="brand"
                  name="brand" 
                  value={form.brand} 
                  placeholder="e.g., Apple, Dell, HP"
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input 
                  id="model"
                  name="model" 
                  value={form.model} 
                  placeholder="e.g., MacBook Pro"
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <div className="flex gap-2">
                  <Input 
                    id="sku"
                    name="sku" 
                    value={form.sku} 
                    placeholder="Product SKU"
                    onChange={handleChange} 
                  />
                  <Button type="button" variant="outline" onClick={generateSKU}>
                    Generate
                  </Button>
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="processor">Processor *</Label>
                <Input 
                  id="processor"
                  name="processor" 
                  value={form.processor} 
                  placeholder="e.g., Intel Core i7, M2 Pro"
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ram">RAM *</Label>
                <Input 
                  id="ram"
                  name="ram" 
                  value={form.ram} 
                  placeholder="e.g., 16GB DDR4"
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storage">Storage *</Label>
                <Input 
                  id="storage"
                  name="storage" 
                  value={form.storage} 
                  placeholder="e.g., 512GB SSD"
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="display">Display *</Label>
                <Input 
                  id="display"
                  name="display" 
                  value={form.display} 
                  placeholder="e.g., 16-inch Retina Display"
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="graphics">Graphics Card</Label>
              <Input 
                id="graphics"
                name="graphics" 
                value={form.graphics} 
                placeholder="e.g., NVIDIA RTX 3060, Integrated"
                onChange={handleChange} 
              />
            </div>

            {/* Pricing */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Selling Price (K) *</Label>
                <Input 
                  id="price"
                  name="price" 
                  type="number"
                  step="0.01"
                  value={form.price} 
                  placeholder="15000"
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="original_price">Original Price (K)</Label>
                <Input 
                  id="original_price"
                  name="original_price" 
                  type="number"
                  step="0.01"
                  value={form.original_price} 
                  placeholder="18000"
                  onChange={handleChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weekly_payment">Weekly Payment (K) *</Label>
                <Input 
                  id="weekly_payment"
                  name="weekly_payment" 
                  type="number"
                  step="0.01"
                  value={form.weekly_payment} 
                  placeholder="500"
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            {/* Inventory */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select value={form.condition} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="refurbished">Refurbished</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Initial Stock</Label>
                <Input 
                  id="stock_quantity"
                  name="stock_quantity" 
                  type="number"
                  min="0"
                  value={form.stock_quantity} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="min_stock_level">Min Stock Level</Label>
                <Input 
                  id="min_stock_level"
                  name="min_stock_level" 
                  type="number"
                  min="0"
                  value={form.min_stock_level} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            {/* Media */}
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input 
                id="image_url"
                name="image_url" 
                type="url"
                value={form.image_url} 
                placeholder="https://example.com/laptop-image.jpg"
                onChange={handleChange} 
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                name="description" 
                value={form.description} 
                placeholder="Detailed description of the laptop..."
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Laptop...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Add Laptop
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddLaptop;
