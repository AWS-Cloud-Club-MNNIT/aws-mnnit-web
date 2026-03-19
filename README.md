This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Here is the .env file you have to create:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/aws-cloud-club

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Security & Admin Setup
ADMIN_EMAIL=example@gmail.com
ADMIN_PASSWORD=examplepassword
JWT_SECRET=your_jwt_signing_secret_here

NEXT_PUBLIC_APP_URL=http://localhost:3000

```
