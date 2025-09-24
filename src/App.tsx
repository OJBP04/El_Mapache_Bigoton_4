import { PrimeReactProvider } from "primereact/api";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./ComponentsUI/Layout.tsx";
import Catalogos from ".//ComponentsCatalogos/CRUDBarberoComponent.tsx"
import './App.css'

function App() {


  return (

      <PrimeReactProvider>
          <BrowserRouter>
              <Routes>
                  <Route path="/" element={<Layout />}></Route>
                  <Route path="/catalogos" element={<Catalogos />}></Route>
              </Routes>
          </BrowserRouter>
      </PrimeReactProvider>
  );
}

export default App
