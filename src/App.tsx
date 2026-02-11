import { AppRouter } from "./app/AppRouter";
import { ToastProvider } from "./context/ToastContext";
import { ToastContainer } from "./components/ToastContainer";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ToastContainer />
        <AppRouter />
      </ToastProvider>
    </ThemeProvider>
  );
}
