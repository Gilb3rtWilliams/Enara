import { Route, Routes } from "react-router-dom";
import { AppLayout, AuthLayout, PublicLayout, RequireAuth, ScrollToTop } from "./components/Layout";
import { About } from "./pages/About";
import { SignIn, SignUp } from "./pages/Auth";
import { Calendar } from "./pages/Calendar";
import { Check } from "./pages/Check";
import { Dashboard } from "./pages/Dashboard";
import { History } from "./pages/History";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { Privacy } from "./pages/Privacy";
import { Combined, Result, Tier2 } from "./pages/Results";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
        </Route>
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="history" element={<History />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="check" element={<Check />} />
          <Route path="tier2" element={<Tier2 />} />
          <Route path="result" element={<Result />} />
          <Route path="result/combined" element={<Combined />} />
        </Route>
      </Routes>
    </>
  );
}
