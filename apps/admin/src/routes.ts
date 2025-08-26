import { type RouteConfig, layout, route } from "@react-router/dev/routes";

export default [
  layout("applayout.tsx", [
    route("/", "pages/AdminPanel.tsx"),
    route("/database", "pages/DatabaseViewer.tsx"),
  ]),
  layout("loggedoutonly.tsx", [route("/login", "pages/LoginPage.tsx")]),
] satisfies RouteConfig;
