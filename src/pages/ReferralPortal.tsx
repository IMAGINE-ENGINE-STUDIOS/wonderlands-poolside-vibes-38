import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, Zap, Star, TrendingUp, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const referralSchema = z.object({
  referrerName: z.string().min(2, "Name must be at least 2 characters"),
  referrerEmail: z.string().email("Please enter a valid email"),
  referrerPhone: z.string().optional(),
  leadName: z.string().min(2, "Lead name must be at least 2 characters"),
  leadEmail: z.string().email("Please enter a valid email for the lead"),
  leadPhone: z.string().optional(),
  leadCompany: z.string().optional(),
  projectType: z.string().min(1, "Please select a project type"),
  estimatedBudget: z.string().optional(),
  projectDescription: z.string().min(10, "Please provide a detailed description"),
  leadUrgency: z.string().default("medium"),
});

type ReferralFormData = z.infer<typeof referralSchema>;

const ReferralPortal = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
    defaultValues: {
      referrerName: "",
      referrerEmail: "",
      referrerPhone: "",
      leadName: "",
      leadEmail: "",
      leadPhone: "",
      leadCompany: "",
      projectType: "",
      estimatedBudget: "",
      projectDescription: "",
      leadUrgency: "medium",
    },
  });

  const onSubmit = async (data: ReferralFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const referralData = {
        referrer_name: data.referrerName,
        referrer_email: data.referrerEmail,
        referrer_phone: data.referrerPhone || null,
        lead_name: data.leadName,
        lead_email: data.leadEmail,
        lead_phone: data.leadPhone || null,
        lead_company: data.leadCompany || null,
        project_type: data.projectType,
        estimated_budget: data.estimatedBudget ? parseFloat(data.estimatedBudget) : null,
        project_description: data.projectDescription,
        lead_urgency: data.leadUrgency,
        referrer_user_id: user?.id || null,
      };

      const { error } = await supabase.from("referrals").insert([referralData]);

      if (error) throw error;

      toast({
        title: "Referral Submitted Successfully!",
        description: "Thank you for your referral. We'll contact the lead within 24 hours and keep you updated on your commission.",
      });

      form.reset();
    } catch (error) {
      console.error("Error submitting referral:", error);
      toast({
        title: "Submission Error",
        description: "Failed to submit referral. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-teal/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-teal opacity-10"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-6 py-2 text-lg bg-gradient-primary text-white border-0">
              <Gift className="mr-2 h-5 w-5" />
              Referral Program
            </Badge>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-teal bg-clip-text text-transparent mb-6">
              REFERN TO EERN
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Refer quality leads to us and earn a guaranteed 5% commission on every successful project. 
              Turn your network into income with our premium referral program.
            </p>
            
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="glass-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-primary">5%</h3>
                  <p className="text-sm text-muted-foreground">Commission Rate</p>
                </CardContent>
              </Card>
              <Card className="glass-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-teal mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-teal">$2,500</h3>
                  <p className="text-sm text-muted-foreground">Average Commission</p>
                </CardContent>
              </Card>
              <Card className="glass-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <Zap className="h-12 w-12 text-coral mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-coral">24hrs</h3>
                  <p className="text-sm text-muted-foreground">Response Time</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Form */}
          <div className="max-w-4xl mx-auto">
            <Card className="glass-card shadow-2xl border-0">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-foreground mb-2">
                  Submit Your Referral
                </CardTitle>
                <CardDescription className="text-lg">
                  Fill out the form below to refer a potential client and start earning commissions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Referrer Information */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Your Information
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="referrerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">Your Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your full name" 
                                  className="h-12 text-base"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="referrerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">Your Email *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="your.email@example.com" 
                                  className="h-12 text-base"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="referrerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">Your Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="(555) 123-4567" 
                                className="h-12 text-base max-w-md"
                                {...field} 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Lead Information */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-teal flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Lead Information
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="leadName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">Lead Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Lead's full name" 
                                  className="h-12 text-base"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="leadEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">Lead Email *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="lead@company.com" 
                                  className="h-12 text-base"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="leadPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">Lead Phone</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="(555) 987-6543" 
                                  className="h-12 text-base"
                                  {...field} 
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="leadCompany"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">Company Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Company or organization" 
                                  className="h-12 text-base"
                                  {...field} 
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-coral flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Project Details
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="projectType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">Project Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="Select project type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pool-installation">Pool Installation</SelectItem>
                                  <SelectItem value="pool-renovation">Pool Renovation</SelectItem>
                                  <SelectItem value="spa-installation">Spa Installation</SelectItem>
                                  <SelectItem value="paver-installation">Paver Installation</SelectItem>
                                  <SelectItem value="screen-enclosure">Screen Enclosure</SelectItem>
                                  <SelectItem value="pool-equipment">Pool Equipment</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="estimatedBudget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">Estimated Budget</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  placeholder="50000" 
                                  className="h-12 text-base"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                This helps us provide accurate quotes
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="leadUrgency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">Project Urgency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 text-base max-w-md">
                                  <SelectValue placeholder="Select urgency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low - Planning phase</SelectItem>
                                <SelectItem value="medium">Medium - Next 3-6 months</SelectItem>
                                <SelectItem value="high">High - Within 30 days</SelectItem>
                                <SelectItem value="urgent">Urgent - ASAP</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="projectDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">Project Description *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Provide detailed information about the project, location, specific requirements, timeline, and any other relevant details that would help us serve the lead better..."
                                className="min-h-[120px] text-base resize-none"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Include as much detail as possible to help us qualify the lead effectively
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Commission Info */}
                    <Card className="bg-gradient-to-r from-primary/10 to-teal/10 border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <DollarSign className="h-6 w-6 text-primary" />
                          <h4 className="text-lg font-semibold text-primary">Commission Calculation</h4>
                        </div>
                        <p className="text-muted-foreground mb-3">
                          You'll earn 5% commission on the total project value if the lead converts to a sale.
                        </p>
                        {form.watch("estimatedBudget") && (
                          <div className="bg-background/60 rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">Estimated commission for this referral:</p>
                            <p className="text-2xl font-bold text-primary">
                              ${((parseFloat(form.watch("estimatedBudget") || "0") * 0.05).toLocaleString())}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="text-center pt-6">
                      <Button 
                        type="submit" 
                        size="lg"
                        disabled={isSubmitting}
                        className="min-w-[200px] h-14 text-lg bg-gradient-primary hover:from-primary/90 hover:to-teal/90 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Gift className="mr-3 h-5 w-5" />
                            Submit Referral & Earn 5%
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralPortal;