import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/format';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const { name, price, imageUrl } = product;
  
  return (
    <div className="bg-card rounded-lg overflow-hidden h-full flex flex-col">
      <div className="h-36 bg-secondary">
        <img 
          src={imageUrl || '/product-placeholder.png'} 
          alt={name} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-montserrat font-medium text-sm mb-1 line-clamp-2">{name}</h3>
        <p className="text-primary font-semibold mt-auto">{formatCurrency(price)}</p>
        <Button 
          variant="secondary"
          size="sm"
          className="mt-2 w-full hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
          onClick={() => onAddToCart(product)}
        >
          <ShoppingCart className="w-4 h-4 mr-1" /> Adicionar
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
