import { RouterProvider } from "react-router-dom";
import { Router } from "./routers/appRouter";

function App() {
  return <RouterProvider router={Router} />;
}

export default App;
