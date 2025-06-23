import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const CompleteProfile = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [creditScore, setCreditScore] = useState("");
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Error", description: "Not authenticated.", variant: "destructive" });
      setIsLoading(false);
      navigate("/login");
      return;
    }

    // Insert client row
    const { error } = await supabase.from("clients").insert({
      user_id: user.id,
      email: user.email,
      first_name: firstName,
      last_name: lastName,
      phone,
      address,
      national_id: nationalId,
      employment_status: employmentStatus,
      monthly_income: monthlyIncome ? Number(monthlyIncome) : null,
      credit_score: creditScore ? Number(creditScore) : null,
      status,
      notes,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    toast({ title: "Profile completed!", description: "Welcome!" });
    setIsLoading(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded shadow max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Complete Your Profile</h2>
        <Input
          placeholder="First Name"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          required
        />
        <Input
          placeholder="Last Name"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          required
        />
        <Input
          placeholder="Phone"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <Input
          placeholder="Address"
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
        <Input
          placeholder="National ID"
          value={nationalId}
          onChange={e => setNationalId(e.target.value)}
        />
        <Input
          placeholder="Employment Status"
          value={employmentStatus}
          onChange={e => setEmploymentStatus(e.target.value)}
        />
        <Input
          placeholder="Monthly Income"
          type="number"
          value={monthlyIncome}
          onChange={e => setMonthlyIncome(e.target.value)}
        />
        <Input
          placeholder="Credit Score (300-850)"
          type="number"
          min={300}
          max={850}
          value={creditScore}
          onChange={e => setCreditScore(e.target.value)}
        />
        <select
          className="w-full border rounded px-3 py-2"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        <Input
          placeholder="Notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </form>
    </div>
  );
};

export default CompleteProfile;
