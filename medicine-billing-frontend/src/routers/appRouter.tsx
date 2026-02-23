import { createBrowserRouter } from "react-router-dom";
import { PageRoutes } from "./pageRoutes";


export const Router = createBrowserRouter([

  {
    children: [
      {
        children: PageRoutes, 
      },
    ],
  },
]);
