import './App.css'
import HomePageHTML from './Page/HomePage.html?raw'

function App() {
  return (
    <div dangerouslySetInnerHTML={{ __html: HomePageHTML }} />
  )
}

export default App
