import { FeatureProvider } from "./context/FeatureContext";
import MapView from "./components/MapView";

function App() {
  return (
    <FeatureProvider>
      <div style={{ height: "100vh", width: "100vw" }}>
   <MapView />
      </div>
   
    </FeatureProvider>
  );
}

export default App;



