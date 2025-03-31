-- Script SQL para inserir produtos na tabela products
-- Executar este script no SQL Editor do Supabase

-- Remover produtos existentes
DELETE FROM public.products WHERE id > 0;

-- Inserir novos produtos
INSERT INTO public.products (name, description, price, image_url, category_id, in_stock)
VALUES
  ('Foxidil (Minoxidil para barba)', 'Solução para crescimento de barba, 60ml', 7990, 'https://placekitten.com/300/300', 1, true),
  ('Óleo para Barba Los Barbeiros', 'Óleo hidratante e modelador para barba, 30ml', 4500, 'https://placekitten.com/300/300', 1, true),
  ('Shampoo para Barba', 'Shampoo especial para limpeza e cuidado da barba, 150ml', 3550, 'https://placekitten.com/300/300', 1, true),
  ('Pomada Modeladora Matte', 'Pomada com efeito seco para modelagem, 120g', 3990, 'https://placekitten.com/300/300', 2, true),
  ('Pomada Modeladora Premium', 'Pomada com fixação forte e brilho leve, 100g', 4990, 'https://placekitten.com/300/300', 2, true),
  ('Cera Modeladora', 'Cera para definição e textura, 85g', 3290, 'https://placekitten.com/300/300', 2, true),
  ('Cerveja Artesanal IPA', 'Cerveja artesanal estilo IPA, 350ml', 1590, 'https://placekitten.com/300/300', 3, true),
  ('Whisky 12 anos', 'Dose de whisky premium envelhecido por 12 anos, 50ml', 3500, 'https://placekitten.com/300/300', 3, true),
  ('Gin Tônica', 'Drink refrescante de gin com água tônica e limão', 2500, 'https://placekitten.com/300/300', 3, false),
  ('Café Especial', 'Café premium torrado na hora, 80ml', 850, 'https://placekitten.com/300/300', 4, true),
  ('Água Mineral', 'Água mineral sem gás, 500ml', 500, 'https://placekitten.com/300/300', 4, true),
  ('Refrigerante', 'Lata de refrigerante, 350ml', 700, 'https://placekitten.com/300/300', 4, true),
  ('Sanduíche Club', 'Sanduíche completo com frango, bacon e vegetais', 2990, 'https://placekitten.com/300/300', 5, true),
  ('Mix de Amendoim', 'Porção de amendoim torrado com especiarias, 100g', 1200, 'https://placekitten.com/300/300', 5, true),
  ('Tábua de Frios', 'Seleção de queijos e embutidos com torradas', 4500, 'https://placekitten.com/300/300', 5, true),
  ('Pente de Madeira', 'Pente artesanal de madeira para barba', 2500, 'https://placekitten.com/300/300', 6, true),
  ('Kit Tesoura e Pente', 'Kit com tesoura e pente para manutenção da barba em casa', 8990, 'https://placekitten.com/300/300', 6, true),
  ('Necessaire de Couro', 'Necessaire de couro sintético para produtos de barba', 5990, 'https://placekitten.com/300/300', 6, true);

-- Fim do script
