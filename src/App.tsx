import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/SignIn/Login'; 
import Main from './components/Main/Main';
import Header from "./components/Header/Header";
import AppDict from './AppDict';
import EditDict from './EditDict';
import Register from './components/SignIn/Register';
import ForgottenPassword from './components/SignIn/ForgottenPassword';

const App = () => {
  return (
    <BrowserRouter> {/* This is where the Router context is provided */}
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/forgotten-password" element={<ForgottenPassword/>} />
        <Route path="/main"   element={<><Header/><Main/></>} />
        <Route path="/dictionary" element={<AppDict/>}/>
        <Route path="/dictionary/edit/:name" element={<EditDict />} /> {/* Edit page */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
