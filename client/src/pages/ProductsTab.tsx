import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/products/ProductCard';
import ServiceCategoryFilter from '@/components/services/ServiceCategoryFilter';
import { useProducts } from '@/lib/hooks/useProducts';
import type { Product } from '@/lib/types';

const ProductsTab = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const { toast } = useToast();
  const { products, categories, isLoadingProducts, isLoadingCategories } = useProducts();

  // Filter products by category
  const filteredProducts = selectedCategoryId === null 
    ? products 
    : products.filter(product => product.categoryId === selectedCategoryId);

  const handleAddToCart = (product: Product) => {
    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  return (
    <div className="px-4 py-4">
      <div className="mb-4">
        <h2 className="font-montserrat font-semibold text-xl mb-4">Produtos</h2>
        
        {/* Categories Filter */}
        {isLoadingCategories ? (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto py-2 -mx-4 px-4">
            <ServiceCategoryFilter
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />
          </div>
        )}
      </div>
      
      {/* Products Grid */}
      {isLoadingProducts ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum produto disponível nesta categoria
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsTab;
