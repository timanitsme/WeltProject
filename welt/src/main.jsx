import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.jsx'
import {Provider} from "react-redux";
import {store} from "./store/store.js";
import {ToastContainer} from "react-toastify";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <Provider store={store}>
          <App/>
          <ToastContainer
              position="bottom-center"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
          />
      </Provider>
  </StrictMode>,
)
