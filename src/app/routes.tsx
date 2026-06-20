import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/home";
import { LoginPage } from "./pages/login";
import { AccountSettingsPage } from "./pages/account-settings";
import { ViewSelectionPage } from "./pages/view-selection";
import { InspectionsPage } from "./pages/inspections";
import { NewInspectionPage } from "./pages/new-inspection";
import { InspectionDetailPage } from "./pages/inspection-detail";
import { CompletedPage } from "./pages/completed";
import { CalendarPage } from "./pages/calendar";
import { SignaturePortalPage } from "./pages/signature-portal";
import { ForgotPasswordPage } from "./pages/forgot-password";
import { RegisterPage } from "./pages/register";
import { BrokersPage } from "./pages/brokers";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/recuperar-senha",
    Component: ForgotPasswordPage,
  },
  {
    path: "/cadastro",
    Component: RegisterPage,
  },
  {
    path: "/conta",
    Component: AccountSettingsPage,
  },
  {
    path: "/selecionar-visualizacao",
    Component: ViewSelectionPage,
  },
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/nova-vistoria",
    Component: NewInspectionPage,
  },
  {
    path: "/vistorias",
    Component: InspectionsPage,
  },
  {
    path: "/vistoria/:id",
    Component: InspectionDetailPage,
  },
  {
    path: "/vistoria/:id/concluida",
    Component: CompletedPage,
  },
  {
    path: "/calendario",
    Component: CalendarPage,
  },
  {
    path: "/corretores",
    Component: BrokersPage,
  },
  {
    path: "/assinatura/:id/:signatureId",
    Component: SignaturePortalPage,
  },
]);
