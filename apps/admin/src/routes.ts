import { type RouteConfig, layout, route } from "@react-router/dev/routes";

export default [
  layout("adminlayout.tsx", [
    layout("sidebar.tsx", [
      route("/", "pages/Actions.tsx"),
      route("/actions/:actionId", "pages/ActionDashboard.tsx"),
      route("/forms", "pages/FormsList.tsx"),
      route("/forms/:formId/responses", "pages/FormResponses.tsx"),
      route("/forms/:formId", "pages/FormBuilder.tsx"),
      route("/users", "pages/UsersList.tsx"),
      route("/image", "pages/ImageUpload.tsx"),
    ]),
    route("/database", "pages/DatabaseViewer.tsx"),
  ]),
  layout("loggedoutonly.tsx", [route("/login", "pages/LoginPage.tsx")]),
] satisfies RouteConfig;
