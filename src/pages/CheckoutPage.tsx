import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useShoppingCart } from '@/components/ShoppingCartProvider';
import StripeCheckoutButton from '@/components/StripeCheckoutButton';
import { ArrowLeft, DollarSign, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const calculateMonthlyPayment = (amount: number, months = 60, rate = 0.0799) => {
  const monthlyRate = rate / 12;
  if (amount <= 0) return 0;
  return (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cartItems, getCartTotal, getCartCount } = useShoppingCart();

  const total = getCartTotal();
  const monthly = Math.round(calculateMonthlyPayment(total));

  const handleFinancing = () => {
    const productName = `Wonderlands order (${getCartCount() || 1} items)`;
    const url =
      `https://www.lyonfinancial.net/apply/?amount=${Math.round(total)}` +
      `&product=${encodeURIComponent(productName)}` +
      `&description=${encodeURIComponent('Complete Wonderlands configuration')}` +
      `&monthly_payment=${monthly}&loan_term=60&project_type=Pool%20Installation`;
    window.open(url, '_blank');
    toast({ title: 'Financing Application', description: 'Opening Lyon Financial in a new tab.' });
  };

  return (
    <main className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <h1 className="text-3xl font-bold">Checkout</h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cartItems.length === 0 && (
              <p className="text-sm text-muted-foreground">Your shopping list is empty.</p>
            )}
            {cartItems.map((item: any) => {
              const extras = item.extras || [];
              const lineTotal =
                (item.price + extras.reduce((sum: number, e: any) => sum + (e.price || 0), 0)) * item.quantity;
              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {item.name} {item.quantity > 1 && <span className="text-muted-foreground">× {item.quantity}</span>}
                    </span>
                    <span>${lineTotal.toLocaleString()}</span>
                  </div>
                  {extras.map((extra: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-xs text-muted-foreground pl-3">
                      <span>{extra.name}</span>
                      <span>+${(extra.price || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              );
            })}

            <Separator />

            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StripeCheckoutButton
              productId="wonderlands_checkout"
              productName={`Wonderlands order (${getCartCount() || 1} items)`}
              price={total}
              quantity={1}
              className="w-full"
              showFinancingOptions={false}
              cartItems={cartItems}
            />

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">Prefer monthly payments?</p>
              <p className="text-xs text-muted-foreground">
                Finance your project with Lyon Financial — estimated ${monthly.toLocaleString()}/mo over 60 months.
              </p>
              <Button variant="outline" className="w-full gap-2" onClick={handleFinancing} disabled={total <= 0}>
                <DollarSign className="h-4 w-4" />
                Apply for financing
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Secure payment processing.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default CheckoutPage;
