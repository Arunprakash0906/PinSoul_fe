# React + Vite

## Deployment

Set `VITE_API_URL` to the public base URL of the deployed Spring Boot API in
Netlify's environment variables, then trigger a new deploy. Do not set it to
`localhost`; that address refers to each visitor's own device. The backend must
also be publicly reachable and configured to use its production database.

The Netlify SPA rewrite is provided by `public/_redirects`; ensure the deploy
publishes the Vite `dist` directory so direct routes such as `/signin` load.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
"# PinSoul_fe" 
