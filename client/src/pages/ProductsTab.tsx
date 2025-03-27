import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
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
          <div className="overflow-x-auto py-2 flex flex-wrap gap-2">
            <Button
              variant={selectedCategoryId === null ? "default" : "secondary"}
              className="rounded-full whitespace-nowrap font-medium text-sm px-4"
              onClick={() => setSelectedCategoryId(null)}
            >
              Todos
            </Button>
            
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategoryId === category.id ? "default" : "secondary"}
                className="rounded-full whitespace-nowrap font-medium text-sm px-4"
                onClick={() => setSelectedCategoryId(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {/* Products List */}
      {isLoadingProducts ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum produto disponível nesta categoria
        </div>
      ) : (
        <div>
          {/* Se uma categoria específica foi selecionada */}
          {selectedCategoryId !== null && (
            <div className="mb-5">
              <h3 className="font-montserrat font-medium text-lg mb-2">
                {categories.find(cat => cat.id === selectedCategoryId)?.name || "Produtos"}
              </h3>
              <div className="divide-y divide-border">
                {filteredProducts.map(product => (
                  <div key={product.id} className="py-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                      <p className="font-medium text-primary mt-1">
                        {(product.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    <Button 
                      onClick={() => handleAddToCart(product)} 
                      variant="secondary" 
                      size="sm"
                      className="ml-2"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Se nenhuma categoria foi selecionada, agrupar por categoria */}
          {selectedCategoryId === null && categories.map(category => {
            const productsInCategory = products.filter(product => product.categoryId === category.id);
            if (productsInCategory.length === 0) return null;
            
            return (
              <div key={category.id} className="mb-5">
                <h3 className="font-montserrat font-medium text-lg mb-2 flex items-center">
                  {category.icon && <span className="mr-2">{category.icon}</span>}
                  {category.name}
                </h3>
                <div className="divide-y divide-border">
                  {productsInCategory.map(product => (
                    <div key={product.id} className="py-3 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                        <p className="font-medium text-primary mt-1">
                          {(product.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleAddToCart(product)} 
                        variant="secondary" 
                        size="sm"
                        className="ml-2"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductsTab;
