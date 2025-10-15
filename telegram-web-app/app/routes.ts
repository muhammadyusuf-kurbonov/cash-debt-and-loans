import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("routes/welcome.tsx"),  // Default route
  {
    path: "/home",
    lazy: () => import("./routes/home.tsx"),
  }
] satisfies RouteConfig;
