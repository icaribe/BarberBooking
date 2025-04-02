
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { useCart } from '@/lib/hooks/useCart';

const CartPage = () => {
  const { items, removeFromCart, clearCart } = useCart();
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + item.price, 0);
    setTotal(newTotal);
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header title="Carrinho" showBackButton />
        <main className="flex-1 p-4">
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <p className="text-muted-foreground">Seu carrinho está vazio</p>
            <Button asChild>
              <Link href="/products">Ver Produtos</Link>
            </Button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header title="Carrinho" showBackButton />
      <main className="flex-1 p-4">
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={`${item.type}-${item.id}`}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.type === 'product' ? 'Produto' : 'Serviço'}
                  </p>
                  <p className="text-primary font-semibold">{formatCurrency(item.price)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromCart(item)}
                  className="text-destructive"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="fixed bottom-16 left-0 right-0 bg-background border-t p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium">Total</span>
            <span className="text-primary font-semibold">{formatCurrency(total)}</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="flex-1" onClick={clearCart}>
              Limpar
            </Button>
            <Button className="flex-1">
              Finalizar Compra
            </Button>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default CartPage;
