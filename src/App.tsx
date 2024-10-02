// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/SignIn/Login'; 
import Main from './components/Main';
import Header from "./components/Header/Header";
import MainDictionary from "./components/Main";
import DictionaryEdit from "./components/Main";

const App = () => {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/main"   element={<><Header/><Main/></>} />
          <Route path="/dictionary" element={<><Header/><MainDictionary/></>}/>
          <Route path="/editdictionary" element={<><Header/><DictionaryEdit/></>}/>
        </Routes>
    </BrowserRouter>
  );
};

export default App;
