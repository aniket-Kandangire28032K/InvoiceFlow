import { Suspense } from 'react'
import './App.scss'
import AppRoutes from './routes/AppRoutes.jsx'
import Loading from './components/Loading.jsx'

function App() {
  
  return (
    <Suspense fallback={<Loading/>}>
      <AppRoutes/>
    </Suspense>
  )
}

export default App
