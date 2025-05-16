import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.jsx'
import {Provider} from "react-redux";
import {store} from "./store/store.js";
import {ToastContainer} from "react-toastify";
import {ThemeProvider} from "@mui/material/styles";
import dataGridTheme from "./utils/customMUIthemes/dataGridTheme.js";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
          <ThemeProvider theme={dataGridTheme}>
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
          </ThemeProvider>
      </LocalizationProvider>
  </StrictMode>,
)
