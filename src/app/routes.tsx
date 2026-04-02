import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/home";
import { NewInspectionPage } from "./pages/new-inspection";
import { InspectionDetailPage } from "./pages/inspection-detail";
import { CompletedPage } from "./pages/completed";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/nova-vistoria",
    Component: NewInspectionPage,
  },
  {
    path: "/vistoria/:id",
    Component: InspectionDetailPage,
  },
  {
    path: "/vistoria/:id/concluida",
    Component: CompletedPage,
  },
]);
