import "./App.css";
import ScratchPad from "./components/ScratchCard";

function App() {
  return (
    <>
      <ScratchPad
        price={2}
        scratchMessage={"testing"}
      />
    </>
  );
}

export default App;
