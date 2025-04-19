
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DeleteAccountForm = () => {
  const [confirmation, setConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { deleteAccount } = useAuth();
  const navigate = useNavigate();
  
  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteAccount();
      navigate("/");
    } catch (error) {
      // Error is already handled in the auth context
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isConfirmed = confirmation === "DELETE";
  
  return (
    <Card className="w-full max-w-md mx-auto border-destructive/20">
      <CardHeader className="text-destructive">
        <CardTitle className="text-2xl">Delete Account</CardTitle>
        <CardDescription className="text-destructive/80">
          Permanently delete your account and all of your data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">Warning: This action cannot be undone</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            <li>Your account will be permanently deleted</li>
            <li>All your reported problems will remain in the system</li>
            <li>You will lose access to your account immediately</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm" className="text-destructive">
            To confirm, type "DELETE" in uppercase
          </Label>
          <Input
            id="confirm"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="border-destructive/50 focus-visible:ring-destructive"
          />
        </div>
      </CardContent>
      <CardFooter>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full"
              disabled={!isConfirmed || isSubmitting}
            >
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Your account will be permanently
                deleted and you will lose access to all your data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete Account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default DeleteAccountForm;
