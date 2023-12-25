import { Routes, Route, Link } from 'react-router-dom';

import { Main } from '../Main';
import { Harmonics } from '../Harmonics';
import { Harmonics2 } from '../Harmonics2';
import { Harmonics3 } from '../Harmonics3';
import { Harmonics4 } from '../Harmonics4';
import { Harmonics5 } from '../Harmonics5';
import { Octaves } from '../Octaves';
import { Octaves2 } from '../Octaves2';

enum AppRoute {
  MENU = '/',
  MAIN = '/main',
  HARMONICS = '/harmonics',
  HARMONICS_2 = '/harmonics2',
  HARMONICS_3 = '/harmonics3',
  HARMONICS_4 = '/harmonics4',
  HARMONICS_5 = '/harmonics5',
  OCTAVES = '/octaves',
  OCTAVES_2 = '/octaves2',
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
        <li>
          <Link to={AppRoute.HARMONICS_3}>Harmonics 3</Link>
        </li>
        <li>
          <Link to={AppRoute.HARMONICS_4}>Harmonics 4</Link>
        </li>
        <li>
          <Link to={AppRoute.HARMONICS_5}>Harmonics 5</Link>
        </li>
        <li>
          <Link to={AppRoute.OCTAVES}>Octaves</Link>
        </li>
        <li>
          <Link to={AppRoute.OCTAVES_2}>Octaves 2</Link>
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
      <Route path={AppRoute.HARMONICS_3} element={<Harmonics3 />} />
      <Route path={AppRoute.HARMONICS_4} element={<Harmonics4 />} />
      <Route path={AppRoute.HARMONICS_5} element={<Harmonics5 />} />
      <Route path={AppRoute.OCTAVES} element={<Octaves />} />
      <Route path={AppRoute.OCTAVES_2} element={<Octaves2 />} />
    </Routes>
  );
}
