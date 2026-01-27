import React from "react";
import { BrowserRouter } from "react-router-dom";      
// ✅ Path updated: "./RoutesApp" ko badal kar "./pages/RoutesApp" kar diya hai
import RoutesApp from "./pages/RoutesApp"; 
import { StoreProvider } from "./store/StoreContext";  

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <RoutesApp />
      </BrowserRouter>
    </StoreProvider>
  );
}