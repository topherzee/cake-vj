
/**
 * @summery
 *  Wraps around a Three.js GLRenderer and sets up the scene and shaders.
 *
 * @description
 *  Wraps around a Three.js GLRenderer and sets up the scene and shaders.
 *
 * @constructor GlRenderer
 * @example
 *    <!-- a Canvas element with id: glcanvas is required! -->
 *    <canvas id="glcanvas"></canvas>
 *
 *
 *    <script>
 *      let renderer = new GlRenderer();
 *
 *      var red = new SolidSource( renderer, { color: { r: 1.0, g: 0.0, b: 0.0 } } );
 *      let output = new Output( renderer, red )
 *
 *      renderer.init();
 *      renderer.render();
 *    </script>
 */

 /*
    We might try and change THREEJS and move to regl;
    https://github.com/regl-project, http://regl.party/examples => video
    133.6 => ~26kb
 */


    
    import * as THREE from 'three';

    import { EffectComposer } from 'https://threejs.org/examples/jsm/postprocessing/EffectComposer.js';
    import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
    import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
    import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
    import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';


    // const composer = new EffectComposer( renderer.glrenderer );

    var GlRenderer = function( _options ) {

      console.log("START GlRenderer  -------------------")

      var _self = this
    
      /** Set uop options */
      _self.options = { element: 'glcanvas' }
      if ( _options != undefined ) {
        _self.options = _options
      }
    
      // set up threejs scene
      if ( _self.options.canvas ) {
        _self.element = _self.options.canvas
      } else {
        _self.element = document.getElementById(_self.options.element)
      }
    
      _self.onafterrender = function() {}
      
      // default
      // window.innerWidth, window.innerHeight
      if ( _self.options.width && _self.options.height  ) {
        _self.width = _self.options.width
        _self.height = _self.options.height
      }else{
        _self.width = window.innerWidth //_self.element.offsetWidth
        _self.height = window.innerHeight //_self.element.offsetHeight
      }
    
      _self.scene = new THREE.Scene();
      _self.camera = new THREE.PerspectiveCamera( 75, _self.width / _self.height, 0.1, 1000 );
      _self.camera.position.z = 27; // 20
    
      // container for all elements that inherit init() and update()
      _self.nodes = [] // sources modules and effects
    
      // containers for custom customUniforms and customDefines
      _self.customUniforms = {}
      _self.customDefines = {}
    
      // base config, screensize and time
      var cnt = 0.;
      _self.customUniforms['time'] = { type: "f", value: cnt }
      _self.customUniforms['screenSize'] = { type: "v2", value: new THREE.Vector2( _self.width,  _self.height ) }
    
      /**
       * The vertex shader
       * @member GlRenderer#vertexShader
       */
      _self.vertexShader = `
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
      _self.fragmentShader = `
        uniform float time;
        uniform vec2 screenSize;
    
        /* custom_uniforms */\
        /* custom_helpers */\
        varying vec2 vUv;\
        void main() {\
          /* custom_main */\
        }
      `

      _self.fragmentShader2 = `
      uniform float time;
      uniform vec2 screenSize;
  
      /* custom_uniforms */\
      /* custom_helpers */\
      varying vec2 vUv;\
      void main() {\
        /* custom_main */\
      }
    `
    
      // ---------------------------------------------------------------------------
      /** @function GlRenderer.init */
      _self.init = function(  ) {
        console.log("INIT Renderer -------------------")
        //_self.glrenderer = new THREE.WebGLRenderer( { canvas: glcanvas, alpha: false } );
        _self.glrenderer = new THREE.WebGLRenderer( { canvas: _self.element, alpha: false, preserveDrawingBuffer: true } );
    
        const target = new THREE.WebGLRenderTarget( {
					minFilter: THREE.LinearFilter,
					magFilter: THREE.LinearFilter,
					format: THREE.RGBAFormat,
					encoding: THREE.sRGBEncoding
				} );
        
       _self.composer = new EffectComposer( _self.glrenderer );

       const renderPass = new RenderPass( _self.scene, _self.camera );
       _self.composer.addPass( renderPass );

      // const glitchPass = new GlitchPass();
      // _self.composer.addPass( glitchPass );

      // const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
			// 	bloomPass.threshold = 0.5;
			// 	bloomPass.strength = 1.0;
			// 	bloomPass.radius = 0;
      // _self.composer.addPass( bloomPass );

    
      // // const outputPass = new OutputPass();
      // // _self.composer.addPass( outputPass );


        // init nodes
        // reset the renderer, for a new lay out
        /**
         * All the nodes currently added to this renderer
         * @member GlRenderer#nodes
         */
        _self.nodes.forEach(function(n){ n.init() });
    
        // console.log("GLRenderer. Shader: " + _self.fragmentShader);

        // create the shaders

        // shaderMaterial is for the main central screen.
        _self.shaderMaterial = new THREE.ShaderMaterial({
           uniforms: _self.customUniforms,
           defines: _self.customDefines,
           vertexShader: _self.vertexShader,
           fragmentShader: _self.fragmentShader,
           side: THREE.DoubleSide,
           transparent: true
        })

        // shaderMaterial2 is for the SIDE screens.
        _self.shaderMaterial2 = new THREE.ShaderMaterial({
          uniforms: _self.customUniforms,
          defines: _self.customDefines,
          vertexShader: _self.vertexShader,
          fragmentShader: _self.fragmentShader2,
          side: THREE.DoubleSide,
          transparent: true
       })
    
       const ASPECT_RATIO = 16.0 / 9.0;
       const PLANE_WIDTH = 71;
       const PLANE_HEIGHT = PLANE_WIDTH / ASPECT_RATIO;
       const SIDE_SCALE = 0.3;
       const SEGMENTS = 10;
       
        // apply the shader material to a surface
        // CENTRAL SCREEN
        _self.flatGeometry = new THREE.PlaneGeometry( PLANE_WIDTH, PLANE_HEIGHT ,SEGMENTS, SEGMENTS);
        _self.flatGeometry.translate( 0, 0, 0 );
        _self.surface = new THREE.Mesh( _self.flatGeometry, _self.shaderMaterial );
        // surface.position.set(60,50,150);

        // RIGHT SCREEN
        _self.flatGeometry2 = new THREE.PlaneGeometry( PLANE_WIDTH, PLANE_HEIGHT  ,SEGMENTS, SEGMENTS );
        _self.flatGeometry2.rotateY(Math.PI / 1);
        _self.flatGeometry2.translate( 80, -45, 1 );
        _self.surface2 = new THREE.Mesh( _self.flatGeometry2, _self.shaderMaterial2 );
        _self.surface2.scale.set( SIDE_SCALE, SIDE_SCALE, SIDE_SCALE );
        // _self.surface2.rotation.set(Math.PI / 12,0,0)
        // surface.position.set(60,50,150);
    
       // LEFT SCREEN
        _self.flatGeometry3 = new THREE.PlaneGeometry( PLANE_WIDTH, PLANE_HEIGHT  ,SEGMENTS, SEGMENTS );
        _self.flatGeometry3.translate( -80, -45, 1 );
        _self.surface3 = new THREE.Mesh( _self.flatGeometry3, _self.shaderMaterial2 );
        // surface.position.set(60,50,150);
        _self.surface3.scale.set( SIDE_SCALE, SIDE_SCALE, SIDE_SCALE );
        
    

        /**
         * A reference to the threejs scene
         * @member GlRenderer#scene
         */
        _self.scene.add( _self.surface );
        _self.scene.add( _self.surface2 );
        _self.scene.add( _self.surface3 );
      }
    
      // ---------------------------------------------------------------------------
    
      /** @function GlRenderer.render */
      _self.render = function() {
        requestAnimationFrame( _self.render );

        // _self.glrenderer.render( _self.scene, _self.camera );
        _self.composer.render( _self.scene, _self.camera );


        _self.onafterrender()
        _self.glrenderer.setSize( _self.width, _self.height );
        _self.composer.setSize( _self.width, _self.height );
        _self.nodes.forEach( function(n) { n.update() } );
    
        cnt++;
        _self.customUniforms['time'].value = cnt;
      }
    
      // update size!
      _self.resize = function() {
    
        if ( _self.options.autosize ) {
          _self.height = window.innerHeight
          _self.width = window.innerWidth
        }
        
        _self.customUniforms['screenSize'] = { type: "v2", value: new THREE.Vector2( _self.width,  _self.height ) }
        // console.log("resize", _self.width, _self.height)
        // resize viewport (write exception for width >>> height, now gives black bars )
        _self.camera.aspect = _self.width / _self.height;
        _self.camera.updateProjectionMatrix();
        _self.glrenderer.setSize( _self.width, _self.height );
        _self.composer.setSize( _self.width, _self.height );
      }
    
      window.addEventListener('resize', function() {
        _self.resize()
      })
    
      // ---------------------------------------------------------------------------
      // Helpers
    
      // adds nodes to the renderer
      // function is implicit, and is colled by the modules
      _self.add = function( module ) {
        _self.nodes.push( module )
      }
    
      // reset the renderer, for a new lay out
      /**
       * Disposes the renderer
       * @function GlRenderer#dispose
       */
      _self.dispose = function() {
        _self.shaderMaterial
        _self.flatGeometry
        _self.shaderMaterial2
        _self.flatGeometry2
        _self.shaderMaterial3
        _self.flatGeometry3

        _self.scene.remove(_self.surface)
        _self.scene.remove(_self.surface2)
        _self.scene.remove(_self.surface3)
        _self.glrenderer.resetGLState()
        _self.customUniforms = {}
        _self.customDefines = {}
    
        cnt = 0.;
        _self.customUniforms['time'] = { type: "f", value: cnt }
        _self.customUniforms['screenSize'] = { type: "v2", value: new THREE.Vector2( _self.width,  _self.height ) }
    
        // reset the vertexshader
        _self.vertexShader = `
          varying vec2 vUv;
          void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            vUv = uv;
          }
        `
    
        // reset the fragment shader
        _self.fragmentShader = `
          uniform int time;
          uniform vec2 screenSize;
    
          /* custom_uniforms */
          /* custom_helpers */
          varying vec2 vUv;
          void main() {
            /* custom_main */
          }
        `

        // reset the fragment shader
        _self.fragmentShader2 = `
        uniform int time;
        uniform vec2 screenSize;
  
        /* custom_uniforms */
        /* custom_helpers */
        varying vec2 vUv;
        void main() {
          /* custom_main */
        }
      `
    
        _self.nodes = []
      }
    }
    