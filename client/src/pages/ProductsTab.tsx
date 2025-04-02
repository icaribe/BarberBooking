import { useState, ChangeEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Search, Scissors, Disc, Wine, Coffee, Utensils, ShoppingBag } from 'lucide-react';
import { useProducts } from '@/lib/hooks/useProducts';
import ProductCategoryFilter from '@/components/products/ProductCategoryFilter';
import type { Product } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/hooks/useCart'; // Import the useCart hook


const ProductsTab = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { products, categories, isLoadingProducts, isLoadingCategories } = useProducts();
  const { addToCart } = useCart(); // Get the addToCart function from the hook


  // Filtrar produtos por termo de busca e categoria
  const filteredProducts = products
    .filter(product => {
      // Filtro por categoria
      const matchesCategory = selectedCategoryId === null || product.categoryId === selectedCategoryId;

      // Filtro por termo de busca
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesCategory && matchesSearch;
    });

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      type: 'product',
      name: product.name,
      price: product.price
    });

    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao carrinho.`,
    });
  };

  // Função para renderizar ícone com base no nome do ícone da categoria
  const renderCategoryIcon = (iconName: string | null) => {
    if (!iconName) return null;

    switch (iconName) {
      case 'scissors': return <Scissors className="h-5 w-5" />;
      case 'disc': return <Disc className="h-5 w-5" />;
      case 'wine': return <Wine className="h-5 w-5" />;
      case 'coffee': return <Coffee className="h-5 w-5" />;
      case 'burger': return <Utensils className="h-5 w-5" />;
      case 'shopping-bag': return <ShoppingBag className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <div className="px-4 py-4">
      <div className="mb-4">
        <h2 className="font-montserrat font-semibold text-xl mb-2">Produtos</h2>

        {/* Barra de Pesquisa */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Pesquisar produtos..."
            className="pl-10 bg-card"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchTerm('')}
            >
              ×
            </Button>
          )}
        </div>

        {/* Categories Filter */}
        {isLoadingCategories ? (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ProductCategoryFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
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
            // Usar os produtos já filtrados pelo termo de busca
            const productsInCategory = searchTerm
              ? filteredProducts.filter(product => product.categoryId === category.id)
              : products.filter(product => product.categoryId === category.id);
            if (productsInCategory.length === 0) return null;

            return (
              <div key={category.id} className="mb-5">
                <h3 className="font-montserrat font-medium text-lg mb-2 flex items-center">
                  {category.icon && <span className="mr-2">{renderCategoryIcon(category.icon)}</span>}
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