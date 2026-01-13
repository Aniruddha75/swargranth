import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import RagaList from './pages/RagaList';
import RagaDetail from './pages/RagaDetail';
import AddRaga from './pages/AddRaga';
import BandishList from './pages/BandishList';
import AddBandish from './pages/AddBandish';
import SwaraSearch from './pages/SwaraSearch';
import DiaryList from './pages/DiaryList';
import AddDiaryEntry from './pages/AddDiaryEntry';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import KaryakramList from './pages/KaryakramList';
import KaryakramPlanner from './pages/KaryakramPlanner';
import KaryakramPerformance from './pages/KaryakramPerformance';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Home />} />
          
          {/* Raga Routes */}
          <Route path="ragas" element={<RagaList />} />
          <Route path="ragas/new" element={<AddRaga />} />
          <Route path="ragas/:id" element={<RagaDetail />} />
          
          {/* Bandish Routes */}
          <Route path="notes" element={<BandishList />} />
          <Route path="notes/new" element={<AddBandish />} />
          
          {/* Diary Routes */}
          <Route path="diary" element={<DiaryList />} />
          <Route path="diary/new" element={<AddDiaryEntry />} />
          
          {/* Helper Routes */}
          <Route path="search/swara" element={<SwaraSearch />} />

          {/* Karyakram Routes */}
          <Route path="karyakrams" element={<KaryakramList />} />
          <Route path="karyakrams/new" element={<KaryakramPlanner />} />
          <Route path="karyakrams/:id" element={<KaryakramPlanner />} />
        </Route>
        
        {/* Fullscreen Routes (outside layout) */}
        <Route path="/karyakrams/:id/perform" element={<ProtectedRoute><KaryakramPerformance /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
