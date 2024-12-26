// app.routes.ts
import { Routes } from "@angular/router";
import { ContentEditorComponent } from "./components/content-editor/content-editor.component";
import { ReservationComponent } from "./components/reservation/reservation.component";
import { CartComponent } from "./components/Cart/cart.component";

export const routes: Routes = [
  // // Content Editor routes
  // {
  //   path: "",
  //   component: ContentEditorComponent,
  //   children: [
  //     { path: "description", component: ContentEditorComponent },
  //     { path: "policies", component: ContentEditorComponent },
  //     { path: "features", component: ContentEditorComponent },
  //     { path: "active-contracts", component: ContentEditorComponent },
  //     { path: "draft-contracts", component: ContentEditorComponent },
  //     { path: "expired-contracts", component: ContentEditorComponent },
  //     { path: "rooms", component: ContentEditorComponent },
  //     { path: "availability", component: ContentEditorComponent },
  //     { path: "rates", component: ContentEditorComponent },
  //     { path: "specialOffers", component: ContentEditorComponent },
  //     { path: "rateOffers", component: ContentEditorComponent },
  //     { path: "", redirectTo: "description", pathMatch: "full" },
  //   ]
  // },

  // Booking routes
  {
    path: "booking",
    children: [
      {
        path: "reservations",
        component: ReservationComponent,
        title: "Reservations",
      },
      {
        path: "cart",
        component: CartComponent,
        title: "Shopping Cart"
      }
    ]
  },

  // Redirect empty path to description
  { path: "", redirectTo: "description", pathMatch: "full" },

  // Wildcard route should be last
  { path: "**", redirectTo: "description", pathMatch: "full" }
];
