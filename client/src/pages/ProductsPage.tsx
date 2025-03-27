import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import ProductsTab from '@/pages/ProductsTab';

const ProductsPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-secondary pb-16">
      <Header title="Produtos" showBackButton />
      
      <main className="flex-1 overflow-y-auto">
        <ProductsTab />
      </main>
      
      <BottomNav />
    </div>
  );
};

export default ProductsPage;