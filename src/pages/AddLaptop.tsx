import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { Laptop,ArrowLeft } from "lucide-react";

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
    image_url: ""
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("laptops").insert([
      {
        ...form,
        price: parseFloat(form.price),
        weekly_payment: parseFloat(form.weekly_payment)
      }
    ]);

    if (error) {
      alert("Error adding laptop: " + error.message);
    } else {
      alert("Laptop added successfully");
      navigate("/");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
         <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Laptop className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-semibold">Add Laptop</h1>
            </div>
          </div>
        </div>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Add New Laptop</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {[
              { label: "Name", name: "name", type: "text" },
              { label: "Brand", name: "brand", type: "text"},
              { label: "Model", name: "model", type: "text"},
              { label: "Processor", name: "processor", type: "text"},
              { label: "RAM", name: "ram", type: "number"},
              { label: "Storage", name: "storage", type: "text"},
              { label: "Display", name: "display", type: "text"},
              { label: "Graphics", name: "graphics", type: "text"},
              { label: "Price (K)", name: "price", type: "number"},
              { label: "Original Price (K)", name: "original_price", type: "number"},
              { label: "Weekly Payment (K)", name: "weekly_payment", type: "number"},
              { label: "Image URL", name: "image_url", type: "text"}
            ].map(({ label, name }) => (
              <div className="space-y-2" key={name}>
                <Label htmlFor={name}>{label}</Label>
                <Input 
                    name={name} 
                    value={form[name as keyof LaptopForm]} 
                    type="text"
                    placeholder= {`Enter ${name}`}
                    onChange={handleChange} 
                    required 
                />
              </div>
            ))}

            <div>
              <Label>Condition</Label>
              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="new">New</option>
                <option value="refurbished">Refurbished</option>
                <option value="used">Used</option>
              </select>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea name="description" value={form.description} onChange={handleChange} />
            </div>

            <Button type="submit">Add Laptop</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddLaptop;
