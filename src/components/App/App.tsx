import { Routes, Route, Link } from 'react-router-dom';

import { Main } from '../Main';
import { Harmonics } from '../Harmonics';

enum AppRoute {
  MENU = '/',
  MAIN = '/main',
  HARMONICS = '/harmonics',
}

function Home() {
  return (
    <div>
      <h1>Home</h1>
      <ul>
        <li>
          <Link to={AppRoute.MAIN}>Main</Link>
        </li>
        <li>
          <Link to={AppRoute.HARMONICS}>Harmonics</Link>
        </li>
      </ul>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path={AppRoute.MENU} element={<Home />} />
      <Route path={AppRoute.MAIN} element={<Main />} />
      <Route path={AppRoute.HARMONICS} element={<Harmonics />} />
    </Routes>
  );
}
