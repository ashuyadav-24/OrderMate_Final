import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import Login from "./components/pages/Login/Login.jsx";
import OTP from "./components/pages/OTP/otpVerification.jsx";
import CreateAccount from "./components/pages/CreateAccount/CreateAccount.jsx";
import Home from "./components/pages/Home/Home.jsx";
import CreateOrder from "./components/pages/CreateOrder/CreateOrder.jsx";
import ActiveOrders from "./components/pages/ActiveOrders/ActiveOrders.jsx";
import ChatRoom from "./components/pages/ChatRoom/ChatRoom.jsx";

import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/otp",
    element: <OTP />,
  },
  {
    path: "/createAccount",
    element: (
      <ProtectedRoute>
        <CreateAccount />
      </ProtectedRoute>
    ),
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
  path: "/create-order",
  element: (
    <ProtectedRoute>
      <CreateOrder />
    </ProtectedRoute>
  ),
},
{
  path: "/active-orders",
  element: (
    <ProtectedRoute>
      <ActiveOrders />
    </ProtectedRoute>
  ),
},
{
  path: "/chat/:orderId",
  element: (
    <ProtectedRoute>
      <ChatRoom />
    </ProtectedRoute>
  ),
},
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);