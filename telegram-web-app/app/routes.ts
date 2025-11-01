import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("routes/welcome.tsx"),  // Default route
  {
    path: "/home",
    file: "./routes/home.tsx",
  },
  {
    path: "/transactions",
    file: "./routes/transactions.tsx",
  },
  {
    path: "/profile",
    file: "./routes/profile.tsx",
  }
] satisfies RouteConfig;
