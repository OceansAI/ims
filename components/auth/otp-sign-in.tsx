'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export function OTPSignIn() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setShowOTPInput(true);
      toast({
        title: "Code Sent",
        description: "Please check your email for the verification code.",
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (code: string) => {
    if (code.length !== 6) return;
    
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });

      if (error) throw error;

      if (data?.session) {
        toast({
          title: "Success",
          description: "Successfully verified! Redirecting...",
        });

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Current session after verification:', currentSession); 
        
        // Wait for the session to be established
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Use window.location.href for a hard redirect
        const redirectTo = searchParams.get('redirectedFrom') || '/';
        console.log('Redirecting to:', redirectTo);

        window.location.href = redirectTo;
      } else {
        console.log('No session data received after verification');
        throw new Error('Failed to establish session');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Error",
        description: error.message || "Invalid verification code.",
        variant: "destructive",
      });
      setOtpCode("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {showOTPInput ? "Enter Verification Code" : "Sign In"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showOTPInput ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  "Send Code"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Verification Code</Label>
                <div className="flex justify-center">
                  <div className="flex gap-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]"
                        maxLength={1}
                        className="w-10 h-12 text-center text-lg"
                        value={otpCode[index] || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          const newOtpCode = otpCode.split('');
                          newOtpCode[index] = value;
                          const newCode = newOtpCode.join('');
                          setOtpCode(newCode);
                          
                          if (value && index < 5) {
                            const nextInput = document.querySelector(
                              `input[type="text"]:nth-of-type(${index + 2})`
                            ) as HTMLInputElement;
                            if (nextInput) nextInput.focus();
                          }
                          
                          if (newCode.length === 6) {
                            handleVerifyOTP(newCode);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
                            const prevInput = document.querySelector(
                              `input[type="text"]:nth-of-type(${index})`
                            ) as HTMLInputElement;
                            if (prevInput) {
                              prevInput.focus();
                              e.preventDefault();
                            }
                          }
                        }}
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-center text-muted-foreground mt-2">
                  We've sent a code to {email}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowOTPInput(false);
                  setOtpCode("");
                }}
                disabled={isLoading}
              >
                Use a different email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}