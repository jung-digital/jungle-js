import _Embers from '../components/Embers';
import _Starfield from '../components/Starfield';
import _Fireworks from '../components/Fireworks';
import Lib from '../lib/Jungle';

window.Jungle = Lib;
window.Embers = _Embers;
window.Starfield = _Starfield;
window.Fireworks = _Fireworks;

export default {
  Embers: _Embers,
  Starfield: _Starfield,
  Fireworks: _Fireworks,
  Lib: Lib
};
