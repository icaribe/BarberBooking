import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
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
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
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

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Nome de usuário já existe" });
      }

      // Criamos o usuário usando a nova função que integra com o Supabase Auth
      const user = await storage.createUser(req.body);

      // Removemos a senha antes de retornar ao cliente
      const { password, ...userWithoutPassword } = user;

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
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
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      
      if (!user) {
        return res.status(401).json({ message: "Nome de usuário ou senha incorretos" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Removemos a senha antes de retornar ao cliente
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
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

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Removemos a senha antes de retornar ao cliente
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });
}