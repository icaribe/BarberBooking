import { ShoppingCart, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/format';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const { name, price, description, inStock } = product;
  
  return (
    <div className="border-b border-border py-3">
      <div className="flex justify-between items-center">
        <div className="flex-1 pr-3">
          <h3 className="font-montserrat font-medium text-sm">{name}</h3>
          <div className="flex justify-between items-baseline mt-1">
            <p className="text-primary font-semibold">{formatCurrency(price)}</p>
            {!inStock && <span className="text-xs text-red-500">Indisponível</span>}
          </div>
          {description && (
            <p className="text-muted-foreground text-xs mt-1 line-clamp-1">{description}</p>
          )}
        </div>
        <Button 
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-primary/10 text-primary"
          onClick={() => onAddToCart(product)}
          disabled={!inStock}
        >
          <PlusCircle className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
