# NestJS Template

A clean and production-ready NestJS template with TypeScript, MongoDB support, validation, and hot reload configured.

## Features

- ✅ **NestJS 10** with TypeScript
- ✅ **Hot Module Replacement (HMR)** for fast development
- ✅ **Environment Configuration** using `@nestjs/config`
- ✅ **MongoDB Support** with Mongoose (optional, ready to use)
- ✅ **Zod Validation** pipe for request validation
- ✅ **ESLint & Prettier** configured
- ✅ **Utility Functions** (UUID, Time, Sleeper)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (optional, if using database)

## Installation

1. Clone or use this template:
```bash
git clone <repository-url>
cd nestjs-template
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment file:
```bash
cp env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=3000
HOST=0.0.0.0
# MONGODB_URI=mongodb://localhost:27017/nestjs-template
```

## Running the App

```bash
# Development mode with hot reload
npm run start:dev

# Standard development mode
npm run start

# Debug mode
npm run start:debug

# Production mode
npm run start:prod
```

The server will start on `http://localhost:3000` (or your configured PORT).

## Project Structure

```
src/
├── app.controller.ts      # Main controller
├── app.service.ts         # Main service
├── app.module.ts          # Root module
├── main.ts                # Application entry point
├── validation.pipe.ts     # Zod validation pipe
└── utils/                 # Utility functions
    ├── GetCurrentTime.ts
    ├── Sleeper.ts
    └── Uuid.ts
```

## Adding MongoDB

1. Uncomment the MongoDB configuration in `src/app.module.ts`:
```typescript
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    // ... other imports
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/nestjs-template'),
  ],
})
```

2. Set `MONGODB_URI` in your `.env` file.

## Using Validation Pipe

The template includes a Zod validation pipe. Example usage:

```typescript
import { ZodValidationPipe } from './validation.pipe';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

@Post()
@UsePipes(new ZodValidationPipe({ schema: createUserSchema, action: 'createUser' }))
createUser(@Body() body: CreateUserDto) {
  // body is validated
}
```

## Creating a New Module

Use NestJS CLI to generate modules:

```bash
# Generate a module
nest g module modules/users

# Generate a controller
nest g controller modules/users

# Generate a service
nest g service modules/users
```

## Scripts

- `npm run build` - Build the project
- `npm run format` - Format code with Prettier
- `npm run lint` - Lint code with ESLint
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage

## Configuration Files

- `nest-cli.json` - NestJS CLI configuration
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.js` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `webpack-hmr.config.js` - Webpack HMR configuration

## License

MIT
