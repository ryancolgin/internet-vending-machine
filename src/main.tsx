import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import { TestResults } from "./pages/TestResults.tsx"
import { MachineProvider } from "./state/MachineContext.tsx"
import { isTestResultsEnabled } from "./lib/env.ts"
import "./styles/tokens.css"
import "./styles/reset.css"
import "./styles/app.css"
import "./styles/machine.css"
import "./styles/results.css"

function Root() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/"

  if (path === "/test-results") {
    if (!isTestResultsEnabled()) {
      window.location.replace("/")
      return null
    }
    return <TestResults />
  }

  return (
    <MachineProvider>
      <App />
    </MachineProvider>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
