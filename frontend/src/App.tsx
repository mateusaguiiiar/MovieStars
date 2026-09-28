import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MovieList } from './pages/MovieList';
import { MovieDetail } from './pages/MovieDetail';
import { MovieForm } from './pages/MovieForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MovieList />} />
        <Route path="/movies/new" element={<MovieForm />} />
        <Route path="/movies/edit/:id" element={<MovieForm />} /> {/* Nova rota para edição */}
        <Route path="/movies/:id" element={<MovieDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;