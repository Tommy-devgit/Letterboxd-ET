# Letterboxd-ET Serverless API

This directory contains the Vercel serverless entrypoint for the NestJS API.

It reuses `server/src/app.module.ts`, so local Nest development and the serverless deployment run the same modules, controllers, DTOs, Prisma service, auth guard, and validation rules.

Deploy notes:

1. Create a separate Vercel project for the API.
2. Set the Vercel root directory to `serverless`.
3. Vercel will install `serverless/package.json`, including the existing Nest server through `file:../server`.
4. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_ISSUER`
   - `CLIENT_URL`
5. Point the frontend `NEXT_PUBLIC_API_URL` to the deployed API URL plus `/api`.
