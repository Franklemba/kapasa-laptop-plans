
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

export const ProfileNotice = () => {
  return (
    <Card className="mb-6 bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start space-x-2">
          <User className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Your Information</h3>
            <p className="text-sm text-blue-700">
              We've pre-filled your basic information from your profile. You can review and edit any details below if needed.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
