FileManager.prototype = new Addon();
FileManager.constructor = FileManager;

/**
* @summary
*  Allows for fast switching between a prefefined list of files (or 'sets' )
*
* @description
*  The filemanager allows you to load up a large number of video files and attach them to a VideoSource.
*
*  A 'set' is simply a .json file, with an array with sources like so:
*
*  ```
*   [
*    "https://some.domain.com/space/filename_1.mp4",
*    "https://some.domain.com/space/filename_2.mp4",
*    "https://some.domain.com/space/filename_3.mp4",
*    "https://some.domain.com/space/filename_4.mp4",
*    "https://some.domain.com/space/filename_5.mp4",
*    "https://some.domain.com/space/filename_6.mp4",
*   ]
*  ```
*
* if you use streamable.com, that lets you upload files for free, you can use
* the route for that, with the streamable id
*
*  ```
*   [
*    "/streamable/39xt5t",
*    "/streamable/99gag3",
*    "/streamable/vwg6r2",
*    "/streamable/jbeixg",
*    "/streamable/8h2r0u"
*   ]
*  ```
*
* @example
*   var source1 = new VideoSource( renderer )
*   var myFilemanager = new FileManager( source1 )
*   myFilemanager.load_set( "myset.json")
*
*   // randomly choose one from the set.
*   myFilemanager.change()
*
* @constructor Addon#FileManager
* @implements Addon
* @param source{Source#VideoSource} a reference to a (video) Source, or Gif source. Source needs to work with files
*/

function FileManager( _source ) {

  var _self = this
  _self.function_list = [["CHZ", "method","changez"]]

  _self.uuid = "Filemanager_" + (((1+Math.random())*0x100000000)|0).toString(16).substring(1);
  _self.type = "AddOn"
  _self.defaultQuality = ""
  _self.source = _source

  /** @member Addon#Filemanager#debug {boolean} */
  _self.debug = false

  /** @member Addon#Filemanager.set {array} */
  _self.set = []

  /**
   * @description
   *  select a source based on its number in the set
   * @function Addon#FileManager#load_set
   *
   * @param {object} json encoded array object
  */
  _self.load_set = function( _set ) {
    var u = new Utils()
    u.get( _set, function(d) {
      _self.set = JSON.parse(d)
    })
  }

  /**
   * @description
   *  init, should be automatic, but you can always call gamepad.init() yourself
   * @function Addon#FileManager#setSrc
   *
  */

  /* helper */
  if ( window.in_app != undefined ) {
    _self.eu = window.eu
  }

  _self.setSrc = function( file ) {
    if ( window.in_app == undefined ) {
      _self.source.src(file)
      console.log("filemanager: set normal source:", file)
    }else{
      _self.source.src(_self.eu.check_file(file) )
      console.log("filemanager: set checked source:", _self.eu.check_file(file) )
    }
  }

  // load entire set
  // filemanager.set.forEach(function(item) { window.eu.check_file(item) })

  // ---------------------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------------------

  /**
   * @description
   *  update the current _set_ of files in the filemanager
   * @function Addon#FileManager#load
   * @param {string} reference to a json filewith the set
   *
  */
  _self.load = function( _file ) {
    var u = new Utils()
    u.get( _file, function(d) {
      _self.set = JSON.parse(d)
      if (_self.debug = false) console.log("got set: ",_self.set )
    })
  }

  /**
   * @description
   *  select a file based on its number in the set
   * @function Addon#FileManager#changeToNum
   * @params {integer} number of the file in the set
   *
  */
  _self.changeToNum = function( _num ) {
    _self.setSrc( _self.set[_num] );
    if (_self.debug = false) console.log("changed file: ", _num, self.set[_num] )
  }

  /**
   * @description
   *  select a file based on its url, regardless of the current set
   * @function Addon#FileManager#changeToUrl
   *
  */
  _self.changeToUrl = function( _url ) {
    _self.setSrc( _url );
    if (_self.debug = false) console.log("changed file from url: ", _num, self.set[_num] )
  }

  /**
   * @description
   *  selects another file from the set
   *  if a parameter is given, it will select that file from the set
   * @function Addon#FileManager#change
   * @param {integer} (optional) number of the file in the set
   *
  */
  _self.change = function( _num ) {
    if ( _self.set.length != 0 ) {
      if ( _num != undefined ) {
        _self.changeToNum( _num );
        return;
      }

      var r = _self.set[ Math.floor( Math.random() * _self.set.length ) ];
      _self.setSrc( r );
      if (_self.debug = false) console.log("changed file: ", r )
    }
    return;
  }

  /**
   * @description
   *  Alias for change
   * @alias Addon#FileManager#changez
   *
  */
  _self.changez = function( _num ){
    _self.change( _num )
  }

  /* TODO: would require more complex sets */
  _self.getSrcByTag = function( _tag ) {}
}
