import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Debug: log the inlined build-time API base and any runtime override
// This helps verify VITE_API_BASE_URL was picked up during build on Vercel
// (Will be replaced at build-time; undefined / '' means not set)
// @ts-ignore
const buildTimeApiBase = import.meta.env?.VITE_API_BASE_URL;
// @ts-ignore
const runtimeApiBase = (window as any).__API_BASE_URL;
if (buildTimeApiBase) {
	console.info('[boot] VITE_API_BASE_URL (build-time):', buildTimeApiBase);
} else {
	console.warn('[boot] VITE_API_BASE_URL missing at build-time. Falling back to runtime or same-origin.');
}
if (runtimeApiBase) {
	console.info('[boot] window.__API_BASE_URL (runtime):', runtimeApiBase);
}
// Provide a helper to update runtime base without rebuild
// Usage in DevTools: window.setApiBase('https://renewly-ccln.vercel.app')
// @ts-ignore
(window as any).setApiBase = (url) => { (window as any).__API_BASE_URL = url; console.info('[boot] Runtime API base overridden to', url); };

createRoot(document.getElementById("root")!).render(<App />);
