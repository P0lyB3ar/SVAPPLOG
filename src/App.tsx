// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/SignIn/Login'; 
import Main from './components/Main';
import Header from "./components/Header/Header";
import MainDictionary from "./components/Main/MainDictionary";
import DictionaryEdit from "./components/Main/DictionaryEdit";

const App = () => {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/main"   element={<><Header/><Main/></>} />
          <Route path="/dictionary" element={<><Header/><MainDictionary/></>}/>
          <Route path="/dictionary/edit/:name" element={<DictionaryEdit />} /> {/* Edit page */}
        </Routes>
    </BrowserRouter>
  );
};

export default App;
