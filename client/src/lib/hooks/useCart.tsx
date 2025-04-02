import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';
import { formatCurrency } from '../constants';

// Tipos
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  type: 'product' | 'service';
  image_url?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number, type: 'product' | 'service') => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

// Contexto do Carrinho
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider do Carrinho
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Carregar o carrinho do localStorage na inicialização
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Erro ao carregar o carrinho:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);
  
  // Salvar o carrinho no localStorage quando ele for atualizado
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);
  
  // Calcular totais
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Adicionar item ao carrinho
  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      // Verificar se o item já existe no carrinho
      const existingItem = prevItems.find(
        item => item.id === newItem.id && item.type === newItem.type
      );
      
      if (existingItem) {
        // Se for um serviço, não aumentar a quantidade (serviços são únicos)
        if (newItem.type === 'service') {
          toast({
            title: 'Serviço já adicionado',
            description: 'Este serviço já está no seu carrinho.',
            variant: 'default',
          });
          return prevItems;
        }
        
        // Se for um produto, aumentar a quantidade
        toast({
          title: 'Produto adicionado',
          description: `Quantidade de ${newItem.name} aumentada.`,
          variant: 'default',
        });
        
        return prevItems.map(item => 
          item.id === newItem.id && item.type === newItem.type
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      // Se o item não existir, adicionar ao carrinho
      toast({
        title: newItem.type === 'product' ? 'Produto adicionado' : 'Serviço adicionado',
        description: `${newItem.name} adicionado ao carrinho.`,
        variant: 'default',
      });
      
      return [...prevItems, { ...newItem, quantity: 1 }];
    });
  };
  
  // Remover item do carrinho
  const removeItem = (id: number, type: 'product' | 'service') => {
    setItems(prevItems => {
      const removedItem = prevItems.find(item => item.id === id && item.type === type);
      
      if (removedItem) {
        toast({
          title: type === 'product' ? 'Produto removido' : 'Serviço removido',
          description: `${removedItem.name} removido do carrinho.`,
          variant: 'default',
        });
      }
      
      return prevItems.filter(item => !(item.id === id && item.type === type));
    });
  };
  
  // Atualizar quantidade de um item
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) {
      // Se a quantidade for menor que 1, remover o item
      const item = items.find(item => item.id === id);
      if (item) {
        removeItem(id, item.type);
      }
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  // Limpar o carrinho
  const clearCart = () => {
    setItems([]);
    toast({
      title: 'Carrinho limpo',
      description: 'Todos os itens foram removidos do carrinho.',
      variant: 'default',
    });
  };
  
  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook para usar o contexto do carrinho
export function useCart() {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  
  return context;
}