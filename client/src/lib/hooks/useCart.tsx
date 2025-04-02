import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '../../hooks/toast-context';

// Definição do tipo de produto no carrinho
export interface CartItem {
  id: string;
  name: string;
  price: number; // preço em centavos
  quantity: number;
  image_url?: string;
}

// Interface do contexto do carrinho
interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  totalItems: number;
  totalPrice: number;
}

// Criação do contexto
const CartContext = createContext<CartContextType | null>(null);

// Chave para armazenamento no localStorage
const STORAGE_KEY = 'los-barbeiros-cart';

// Provider do carrinho
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { addToast } = useToast();

  // Carregar itens do localStorage na montagem
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEY);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Erro ao carregar o carrinho:', error);
    }
  }, []);

  // Salvar itens no localStorage quando mudam
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Adicionar item ao carrinho
  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      // Verificar se o item já existe no carrinho
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id);

      if (existingItemIndex >= 0) {
        // Se existir, aumentar a quantidade
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        
        addToast({ 
          title: 'Produto atualizado',
          description: `Quantidade de ${item.name} atualizada no carrinho`,
          type: 'success'
        });
        
        return updatedItems;
      } else {
        // Se não existir, adicionar como novo com quantidade 1
        addToast({ 
          title: 'Produto adicionado',
          description: `${item.name} foi adicionado ao carrinho`,
          type: 'success'
        });
        
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  // Remover item do carrinho
  const removeItem = (itemId: string) => {
    setItems(prevItems => {
      const item = prevItems.find(i => i.id === itemId);
      
      if (item) {
        addToast({ 
          title: 'Produto removido',
          description: `${item.name} foi removido do carrinho`,
          type: 'info'
        });
      }
      
      return prevItems.filter(item => item.id !== itemId);
    });
  };

  // Limpar o carrinho
  const clearCart = () => {
    setItems([]);
    addToast({ 
      title: 'Carrinho limpo',
      description: 'Todos os itens foram removidos do carrinho',
      type: 'info'
    });
  };

  // Atualizar a quantidade de um item
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  // Calcular o número total de itens
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calcular o preço total (em centavos)
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Valor do contexto
  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    clearCart,
    updateQuantity,
    totalItems,
    totalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Hook para usar o carrinho
export function useCart() {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  
  return context;
}