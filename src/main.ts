import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const cookieParser = require('cookie-parser');

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'], // Configure logging: 'log', 'fatal', 'error', 'warn', 'debug', 'verbose'
  });

  // Trust proxy if behind reverse proxy (nginx) - required for X-Forwarded-Proto header
  // This allows req.protocol to correctly reflect HTTPS when behind nginx
  // Get the underlying Express instance to configure trust proxy
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);
  console.log('✅ [Bootstrap] Trust proxy enabled (for X-Forwarded-Proto support)');
  
  // Serve static files from uploads directory
  const express = require('express');
  const path = require('path');
  expressApp.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  console.log('✅ [Bootstrap] Static file serving enabled for /uploads');

  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';
  const originURL =  [
  'http://localhost:5190', 
  'https://localhost:5190', 
  "https://172.16.255.206:5190",
  "http://172.16.255.206:5190",
  "https://localhost:443",        // Nginx HTTPS proxy
  "https://127.0.0.1:443",        // Nginx HTTPS proxy (localhost IP)
  "https://172.16.255.206:443",   // Nginx HTTPS proxy (network IP)
  "http://172.16.255.206:443"     // Fallback (shouldn't be needed, but included for safety)
];
  
  // Enable cookie parser middleware FIRST - REQUIRED for httpOnly cookies
  // Must be registered before CORS to parse cookies correctly
  app.use(cookieParser());
  console.log('✅ [Bootstrap] Cookie parser middleware registered');
  
  // CORS configuration - Required for cookie-based authentication
  app.enableCors({
    origin: originURL, // Frontend URL
    credentials: true, // Required for httpOnly cookies (access_token, refresh_token)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });
  console.log('✅ [Bootstrap] CORS enabled');
  
  // Logging middleware - log request details including cookies
  // This must come AFTER cookieParser so cookies are parsed
  app.use((req: any, res: any, next: any) => {
    console.log('🔵 [Request]', req.method, req.path, '| Origin:', req.headers.origin);
    console.log('🔵 [Request] Cookies:', req.cookies ? Object.keys(req.cookies).join(', ') : 'No cookies');
    if (req.cookies && req.cookies.access_token) {
      console.log('✅ [Request] Access token cookie found');
    } else {
      console.log('❌ [Request] Access token cookie NOT found');
    }
    next();
  });
  console.log('✅ [Bootstrap] Request logging middleware registered');

  await app.listen(port, host, () => {
    console.log(`✅ [Bootstrap] Server is running on http://${host}:${port}`);
    console.log(`✅ [Bootstrap] Server ready to accept connections`);
  });

  // Hot Module Replacement (HMR) support
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
