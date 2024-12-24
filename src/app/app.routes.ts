import { Routes } from "@angular/router";
import { ContentEditorComponent } from "./components/content-editor/content-editor.component";
import { ReservationComponent } from "./components/reservation/reservation.component";

export const routes: Routes = [
  { path: "description", component: ContentEditorComponent },
  { path: "policies", component: ContentEditorComponent },
  { path: "features", component: ContentEditorComponent },
  { path: "active-contracts", component: ContentEditorComponent },
  { path: "draft-contracts", component: ContentEditorComponent },
  { path: "expired-contracts", component: ContentEditorComponent },
  { path: "rooms", component: ContentEditorComponent },
  { path: "availability", component: ContentEditorComponent },
  { path: "rates", component: ContentEditorComponent },
  { path: "specialOffers", component: ContentEditorComponent },
  { path: "rateOffers", component: ContentEditorComponent },
  { path: "", redirectTo: "description", pathMatch: "full" },
  { path: "**", redirectTo: "description", pathMatch: "full" },
  {
    path: "reservations",
    component: ReservationComponent,
    title: "Reservations",
  },
];
