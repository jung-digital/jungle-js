/*============================================*\
 * Imports
\*============================================*/

/*============================================*\
 * Constants
\*============================================*/

/*============================================*\
 * Class
\*============================================*/
/**
 * Audio Loader class
 */
class AudioLoader  {
  //---------------------------------------------
  // Constructor
  //---------------------------------------------
  /**
   *
   */
  constructor(url, context) {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    this._url = url;
    this._audioContext = context || new AudioContext();
  }

  //---------------------------------------------
  // Methods
  //---------------------------------------------
  loadAudioFile() {
    this._xhr = new XMLHttpRequest();
    this._xhr.responseType = "arraybuffer";
    this._xhr.onload = this._onAudioLoad();
  }

  //---------------------------------------------
  // Properties
  //---------------------------------------------
  var _url = "";
  var _audioContext;
  var _xhr;
  var _loadedBuffer;

  //---------------------------------------------
  // Event Handlers
  //---------------------------------------------
  _onAudioLoad() {
    this._audioContext.decodeAudioData(this._xhr.response, function(buffer) {
      this._loadedBuffer = buffer;
    });
  }

}

export default AudioLoader;
