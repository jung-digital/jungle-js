import _Embers from '../components/Embers';
import _Starfield from '../components/StarField';
import Lib from '../lib/Jungle';

window.Jungle = Lib;
window.Embers = _Embers;
window.Starfield = _Starfield;

export default {
  Embers: _Embers,
  Starfield: _Starfield,
  Lib: Lib
};
