import Header from './components/Header/Header';
import MainDictionary from './components/Main/MainDictionary';
import './App.css';

// Sample dictionaries data
const dictionaries = [
    { name: 'English' },
    { name: 'Spanish' },
    { name: 'French' }
];

function AppDict() {
    return (
        <>
            <Header />
            <MainDictionary dictionaries={dictionaries} />
        </>
    );
}

export default AppDict;
