import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Route, Link} from "react-router-dom"
import Fib from "./Fib";
import OtherPage from "./OtherPage";

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Link to="/" className="link">Home </Link>
          <Link to="/otherpage" className="link">Other Page</Link>
        </header>
        <Route exact path="/" component={Fib}/>
        <Route path="/otherpage" component={OtherPage}/>
      </div>
    </Router>
  );
}

export default App;
