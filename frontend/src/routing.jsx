import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import App from "./App";
import Products from "./Products";
import Cars from "./Cars";
import ProductDetail from "./ProductDetail";
import CarDetail from "./CarDetail";
import Navbar from "./components/Navbar";
import WhatsApp from "./WhatsApp";

export default function Routing() {
  return (
    <>
        <BrowserRouter>
            <Routes>
                <Route element={<><Navbar /><Outlet /></>}>
                    <Route index element={<App />} />
                    <Route path="home" element={<App />} />
                    <Route path="products" element={<Products />} />
                    <Route path="products/:id" element={<ProductDetail />} />
                    <Route path="cars" element={<Cars />} />
                    <Route path="cars/:id" element={<CarDetail />} />
                    <Route path="whatsapp" element={<WhatsApp />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </>
  )
}