import logo from './logo.svg';
import TextEditor from './TextEditor';
import './App.css';
import {v4 as uuidV4} from 'uuid'
import{
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate

}from 'react-router-dom'

function App() {
  return (
  // <TextEditor/>
  <Router>
      <Routes>
        {/* Redirect from '/' to a new document ID */}
        <Route path="/" element={<Navigate to={`/documents/${uuidV4()}`} replace />} />
        
        {/* Route to the TextEditor */}
        <Route path="/documents/:id" element={<TextEditor />} />
      </Routes>
    </Router>
  )
}

export default App;
