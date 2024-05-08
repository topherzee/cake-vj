
/**
  * @summary
  *  takes a mapping file and copies the output from ant to the configuration
  * @description
  *  takes a node somewhere in your network, and copies the output according
  *  to the mapping fike, a json file that configures the ins and outs of
  *  the map and slices. Might take multiple source, might render multiple outputs
  * @example
  *  Not available yet
  */


var Mapping = class {

    // information functions
    static function_list() {
      return []
    }
  
    static help() {
      return "ownoes"
    }
  
    constructor( renderer, options ) {
  
      // create and instance
      var _self = this;
      if (renderer == undefined) return
  
      // set or get uid
      if ( options.uuid == undefined ) {
        _self.uuid = "Mapping_" + (((1+Math.random())*0x100000000)|0).toString(16).substring(1);
      } else {
        _self.uuid = options.uuid
      }
  
      _self.renderer = renderer
      _self.source = options.source
  
      // add to renderer
      renderer.add(_self)
  
      // set options
      var _options;
      if ( options != undefined ) _options = options
  
      // set type
      _self.type = "Module";
      _self.internal_renderer = null
  
      /**
       * @description
       *  initializes the mapping through the (main) renderer
       * @example
       *  none
       * @function Addon#Mapping~init
       */
  
      _self.init = function() {
  
        /* TODO: rewrite into scenes?
  
          https://discourse.threejs.org/t/how-can-i-copy-a-webglrendertarget-texture-to-a-canvas/6897
          https://threejs.org/examples/webgl_multiple_canvases_grid.html
          https://stackoverflow.com/questions/41841441/three-js-drawing-texture-directly-to-canvas-without-creating-a-plane-in-a-bill
          https://threejs.org/docs/#api/en/renderers/WebGLRenderer.copyTextureToTexture
  
          okay, so this works, but! it could be more robust,
          if I read the documentation righg, there is a maximum of 8 canvasses
          for WebGL, but one renderer can adress different canvasses, so we might
          want to extend the original renderer with an extra scene, insteat of
          rewriting the whole thing
        */
        
  
        // copy the fragment and vertex shader so far
        /**
         * The vertex shader
         * @member GlRenderer#vertexShader
         */
          _self.vertexShader_test = `
          varying vec2 vUv;\
          void main() {\
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\
            vUv = uv;\
          }
        `
  
        /**
          * The fragment shader
          * @member GlRenderer#fragmentShader
          */
          // base fragment shader
          _self.fragmentShader_test = `
            uniform float time;
            uniform vec2 screenSize;
  
            /* custom_uniforms */\
            /* custom_helpers */\
            varying vec2 vUv;\
            void main() {\
              /* custom_main */\
            }
          `
       
        // create an internal renderer
        _self.internal_renderer = new GlRenderer({element: options.element});
  
        // copy the fragment and vertex shader so far
        console.log(" fragment_shader: ")
        // console.log(_self.renderer.fragmentShader)
        _self.internal_renderer.fragmentShader = _self.renderer.fragmentShader
        _self.internal_renderer.vertexShader = _self.renderer.vertexShader
  
        // copy the uniforms and defines so far
        console.log(" uniforms: ")
        console.log(_self.renderer.customUniforms)
        
        //_self_internal_uniforms = JSON.parse(JSON.stringify(_self.renderer.customUniforms));
        //_self_internal_defines =  JSON.parse(JSON.stringify(_self.renderer.customDefines));
        
        //_self_internal_uniforms = structuredClone( _self.renderer.customUniforms  )
        //_self_internal_defines = structuredClone( _self.renderer.customDefines  )
  
         
        //_self_internal_uniforms = structuredClone( _self.renderer.customUniforms  )
        //_self_internal_defines = structuredClone( _self.renderer.customDefines  )
  
  
        _self.internal_renderer.customUniforms = _self.renderer.customUniforms
        _self.internal_renderer.customDefines = _self.renderer.customDefines
  
        // add an output node
        var internal_output = new Output( _self.internal_renderer, _self.source )
  
        // initalize local rendering
        _self.internal_renderer.init()
        _self.internal_renderer.render()
      }
  
      /** @function Addon#Mapping~update */
      /**
       * @description
       *  description
       * @example
       *  example
       * @function Module#Mapping#update
       *
       */
  
      _self.update = function() {
        // TODO: we could handle render update functions locally, this would allow
        // to set lower framerate or color depth, making the previews less resource
        // intensive.
  
        const sourceCanvas = document.getElementById('sourceCanvas');
  
      }
  
      /**
       * @description
       *  loads a pixelmap into the mapping addon
       * @example
       *  myMapping.load_pixelmap
       * @function Addon#Mapping~load_pixelmap
       */
  
      _self.mapping = {}
      _self.load_pixelmap = function( _pixel_map ) {
        var u = new Utils()
        u.get( _pixel_map, function(d) {
          _self.mapping = JSON.parse(d)
        })
      }
  
      /*
        example mappings
  
        in: any node in the network
        out: mapping windows
        for each in we can have multiple outs?
        
        slice1: {
          slice_in: { node: node, x: 0, y: 0, w: 1, h: 1 }
          slice_out: [
            { canvas: "monit1", x:0  , y:0, w:100, h:100 },
            { canvas: "monit2", x:100, y:0, w:100, h:100 },
            { canvas: "monit3", x:200, y:0, w:100, h:100 }, 
          ]
        },
        slice2: {}
      */
  
    }
  }
  