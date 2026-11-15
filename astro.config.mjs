// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: [
        'c98f-2803-a3e0-1875-b150-f425-5841-9b5c-d444.ngrok-free.app'
      ]
    }
  }
});