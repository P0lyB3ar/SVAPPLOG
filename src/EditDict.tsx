import Header from './components/Header/Header';
import './App.css';
import DictionaryEdit from './components/Main/DictionaryEdit';

// Mock data for dictionaryName and actions
const mockDictionaryName = "Sample Dictionary";
const mockActions = ["Action 1", "Action 2", "Action 3"];

function EditDict() {
  return (
    <>
      <Header />
      <DictionaryEdit 
        dictionaryName={mockDictionaryName} 
        actions={mockActions} 
      />
    </>
  );
}

export default EditDict;
