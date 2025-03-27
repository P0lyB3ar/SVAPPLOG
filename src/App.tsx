import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/SignIn/Login'; 
import Main from './components/Main/Main';
import Header from "./components/Header/Header";
import AppDict from './AppDict';
import EditDict from './EditDict';
import Register from './components/SignIn/Register';
import ForgottenPassword from './components/SignIn/ForgottenPassword';
import UserD from './UserD';
import AppOrg from './AppOrg';
import AppApp from './AppApp';
import ApplicationList from "./components/ApplicationList/ApplicationList"

const App = () => {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/forgotten-password" element={<ForgottenPassword/>} />
          <Route path="/main" element={<><Header/><Main/></>} />
          <Route path="/dictionary" element={<AppDict/>}/>
          <Route path="/editdictionary/:name" element={<EditDict/>}/>
          <Route path="/users" element={<UserD/>}/>  
          <Route path="/application" element={<AppApp/>}/>
          <Route path="/organisation" element={<AppOrg/>}/>        
          <Route path="/logs" element={<ApplicationList />} />
        </Routes>
    </BrowserRouter>
  )
};

export default App;
