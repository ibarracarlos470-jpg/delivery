This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## APKs Android (TWA)

El workflow **Build Android APKs (TWA)** firma las apps de cliente y repartidor siempre con la misma llave,
guardada como secret de GitHub. Si la llave cambia, Android no deja actualizar la app instalada y el
dominio deja de verificarse (`public/.well-known/assetlinks.json`).

Configuración, una sola vez:

```bash
keytool -genkeypair -v -keystore android.keystore -alias android \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=TuMarca,OU=Dev,O=TuMarca,L=Caracas,S=Miranda,C=VE"
base64 -w0 android.keystore > android.keystore.b64
```

1. En GitHub → Settings → Secrets and variables → Actions, crea:
   - `ANDROID_KEYSTORE_BASE64`: el contenido de `android.keystore.b64`
   - `ANDROID_KEYSTORE_PASSWORD`: la contraseña que elegiste
2. Guarda `android.keystore` y la contraseña en un lugar seguro (sin ellos no podrás publicar actualizaciones). No la subas al repo.
3. Ejecuta el workflow y copia el valor de `fingerprint.txt` en `sha256_cert_fingerprints` de `public/.well-known/assetlinks.json`.
