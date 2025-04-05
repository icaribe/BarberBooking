import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import bcrypt from 'bcrypt';
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  // Verifica se está usando o formato bcrypt (começa com $2b$)
  if (stored.startsWith('$2b$')) {
    try {
      return await bcrypt.compare(supplied, stored);
    } catch (error) {
      console.error('Erro ao comparar senhas com bcrypt:', error);
      return false;
    }
  } else {
    // Suporte ao formato anterior (scrypt)
    try {
      const [hashed, salt] = stored.split(".");
      const hashedBuf = Buffer.from(hashed, "hex");
      const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
      return timingSafeEqual(hashedBuf, suppliedBuf);
    } catch (error) {
      console.error('Erro ao comparar senhas com scrypt:', error);
      return false;
    }
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Passo 1: Verificar se o usuário existe na tabela users
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`Usuário '${username}' não encontrado.`);
          return done(null, false);
        }

        // Passo 2: Autenticar usando o Supabase Auth
        // Se tiver email, usamos o email, caso contrário usamos o username como email
        const email = user.email || `${username}@example.com`;
        
        const { data: authData, error: authError } = await storage.authenticateWithSupabase(email, password);
        
        if (authError) {
          console.error('Erro na autenticação do Supabase:', authError.message);
          
          // Verificar com a versão local de backup
          if (await comparePasswords(password, user.password)) {
            console.log('Login bem-sucedido usando senha local.');
            return done(null, user);
          }
          
          return done(null, false);
        }
        
        if (authData && authData.user) {
          console.log('Login bem-sucedido usando Supabase Auth.');
          return done(null, user);
        }
        
        return done(null, false);
      } catch (error) {
        console.error('Erro durante autenticação:', error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    console.log('Serializando usuário:', user.id);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log('Desserializando usuário de ID:', id);
      const user = await storage.getUser(id);
      if (!user) {
        console.error('Usuário não encontrado na desserialização:', id);
        return done(null, null);
      }
      done(null, user);
    } catch (error) {
      console.error('Erro ao desserializar usuário:', error);
      done(error, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Nome de usuário já existe" });
      }

      // Criamos o usuário usando a função que integra com o Supabase Auth
      const user = await storage.createUser(req.body);

      // Removemos a senha antes de retornar ao cliente
      const { password, ...userWithoutPassword } = user;

      // Login do usuário após o registro (importante para sessão correta)
      req.login(user, (err) => {
        if (err) {
          console.error('Erro ao fazer login automático após registro:', err);
          return next(err);
        }
        
        // Garantir que temos a sessão correta estabelecida
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('Erro ao salvar sessão após registro:', saveErr);
            return next(saveErr);
          }
          
          console.log('Login automático após registro realizado com sucesso para o usuário:', user.id);
          console.log('Sessão estabelecida:', req.isAuthenticated(), 'user ID:', req.user?.id);
          res.status(201).json(userWithoutPassword);
        });
      });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return res.status(500).json({
        message: "Erro ao criar conta. Verifique os dados fornecidos e tente novamente.",
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  app.post("/api/login", async (req, res, next) => {
    passport.authenticate("local", async (err: Error | null, user: any, info: any) => {
      if (err) return next(err);
      
      if (!user) {
        return res.status(401).json({ message: "Nome de usuário ou senha incorretos" });
      }
      
      req.login(user, async (loginErr: Error | null) => {
        if (loginErr) return next(loginErr);
        
        // Garantir que a sessão seja salva adequadamente
        req.session.save(async (saveErr) => {
          if (saveErr) {
            console.error('Erro ao salvar sessão após login:', saveErr);
            return next(saveErr);
          }
          
          console.log('Login bem-sucedido para o usuário:', user.id);
          console.log('Sessão estabelecida:', req.isAuthenticated(), 'user ID:', req.user?.id);
          
          // Buscar o papel do usuário usando o role-workaround
          const { getUserRole } = await import('../shared/role-workaround');
          const userRole = await getUserRole(user.id);
          
          // Converter o papel para o formato esperado pelo frontend (maiúsculas)
          let role = 'USER';
          if (userRole === 'admin') {
            role = 'ADMIN';
          } else if (userRole === 'professional') {
            role = 'PROFESSIONAL';
          }
          
          // Removemos a senha antes de retornar ao cliente
          const { password, ...userWithoutPassword } = user;
          
          // Adicionar o papel ao objeto do usuário
          res.status(200).json({
            ...userWithoutPassword,
            role
          });
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", async (req, res, next) => {
    // Logout do Supabase Auth
    if (req.user) {
      try {
        await storage.signOutFromSupabase();
      } catch (error) {
        console.error('Erro ao fazer logout do Supabase:', error);
      }
    }
    
    // Logout do Passport
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      console.log('Usuário não autenticado em /api/user');
      return res.sendStatus(401);
    }
    
    try {
      // Buscar informações atualizadas do usuário do banco de dados
      const userId = (req.user as any).id;
      console.log('Buscando informações atualizadas para o usuário ID:', userId);
      
      const user = await storage.getUser(userId);
      if (!user) {
        console.error('Usuário autenticado não encontrado no banco:', userId);
        return res.sendStatus(401);
      }
      
      // Remover a senha antes de retornar ao cliente
      const { password, ...userWithoutPassword } = user;
      
      // Buscar o papel do usuário usando o role-workaround
      const { getUserRole } = await import('../shared/role-workaround');
      const userRole = await getUserRole(userId);
      
      // Converter o papel para o formato esperado pelo frontend (maiúsculas)
      let role = 'USER';
      if (userRole === 'admin') {
        role = 'ADMIN';
      } else if (userRole === 'professional') {
        role = 'PROFESSIONAL';
      }
      
      // Adicionar o papel ao objeto do usuário
      const userWithRole = {
        ...userWithoutPassword,
        role
      };
      
      console.log('Retornando dados do usuário:', userId, userWithRole.username, 'com papel:', role);
      res.json(userWithRole);
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      res.status(500).json({ message: 'Erro ao buscar dados do usuário' });
    }
  });
}