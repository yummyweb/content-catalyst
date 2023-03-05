import './App.css';
import { Routes, Route, Outlet, Link } from "react-router-dom";
import Home from "./components/Home"
import Content from "./components/Content"

function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/content" element={<Content />} />
      </Routes>
    </div>
  );
}

export default App;
