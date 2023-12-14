import { Routes, Route, Link } from 'react-router-dom';

import { Main } from '../Main';
import { Harmonics } from '../Harmonics';
import { Harmonics2 } from '../Harmonics2';

enum AppRoute {
  MENU = '/',
  MAIN = '/main',
  HARMONICS = '/harmonics',
  HARMONICS_2 = '/harmonics2',
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
        <li>
          <Link to={AppRoute.HARMONICS_2}>Harmonics 2</Link>
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
      <Route path={AppRoute.HARMONICS_2} element={<Harmonics2 />} />
    </Routes>
  );
}
