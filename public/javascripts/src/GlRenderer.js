
    
    import * as THREE from 'three';

    const clock = new THREE.Clock();

      const initial_texture = new THREE.TextureLoader().load('./circles.jpg');

    const fb_fragment = /* glsl */ `
uniform vec2 u_resolution;
uniform sampler2D u_in_buffer;
uniform sampler2D u_init_buffer;
uniform float u_time;
uniform float u_extra;

void main() {
  // vec2 uv = gl_FragCoord.xy / u_resolution;

    vec2 st = gl_FragCoord.xy / u_resolution;
    vec2 uv = st;
    uv *= vec2(1. + 0.02 * sin(u_time / 10.), 1. - 0.02 * cos(u_time/2.));

    vec4 sum = texture2D(u_in_buffer, uv);
    vec4 src = texture2D(u_init_buffer, st);
    sum.rgb = mix(sum.rbg, src.rgb, (1.0 - u_extra));
    gl_FragColor = sum;
}
`;

let material_in;//: THREE.ShaderMaterial;
let material_out;//: THREE.MeshBasicMaterial;

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

      _self.setFeedbackEffect = function(value) {
        _self.u_extra = value;
      }
      
      // default
      // window.innerWidth, window.innerHeight
      if ( _self.options.width && _self.options.height  ) {
        _self.width = _self.options.width
        _self.height = _self.options.height
      }else{
        _self.width = window.innerWidth //_self.element.offsetWidth
        _self.height = window.innerHeight //_self.element.offsetHeight
      }

 
      _self.textureA = new THREE.WebGLRenderTarget(
        _self.width, _self.width,
        { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, colorSpace: THREE.LinearSRGBColorSpace  });
      
      _self.textureB = new THREE.WebGLRenderTarget(
        _self.width, _self.width,
        { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, colorSpace: THREE.LinearSRGBColorSpace  });
        
      _self.textureC = new THREE.WebGLRenderTarget(
        _self.width, _self.width,
        { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, colorSpace: THREE.LinearSRGBColorSpace  });
      
      _self.u_extra = 0.5;
    
      _self.scene = new THREE.Scene();
      _self.in_scene = new THREE.Scene();
      _self.in_scene_c = new THREE.Scene();
      _self.camera = new THREE.PerspectiveCamera( 75, _self.width / _self.height, 0.1, 1000 );
      _self.camera.position.z = 27; // 20
    
      _self.cameraSquare = new THREE.PerspectiveCamera( 75, _self.width / _self.width, 0.1, 1000 );
      _self.cameraSquare.position.z = 27; // 20
    
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
  
        _self.glrenderer = new THREE.WebGLRenderer( { canvas: _self.element, alpha: false, preserveDrawingBuffer: true } );
        _self.glrenderer.outputEncoding = THREE.sRGBEncoding;
        _self.glrenderer.outputColorSpace = THREE.LinearSRGBColorSpace;

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
      
        _self.flatGeometry = new THREE.CircleGeometry( PLANE_HEIGHT/2 ,50);
        // _self.flatGeometry.translate( 0, 0, 0 );
        // _self.flatGeometry = new THREE.PlaneGeometry(PLANE_HEIGHT ,PLANE_HEIGHT);
        _self.surface =new THREE.Mesh( _self.flatGeometry,_self.shaderMaterial);
        _self.in_scene_c.add(_self.surface);


        const plane_out = new THREE.PlaneGeometry(PLANE_HEIGHT,PLANE_HEIGHT);
        // const plane_out = new THREE.CircleGeometry( PLANE_HEIGHT/2 ,50);
        material_out = new THREE.MeshBasicMaterial({ map: initial_texture });
        const mesh_out = new THREE.Mesh(_self.flatGeometry, material_out);
        _self.scene.add(mesh_out);
      
       


        // RIGHT SCREEN
        _self.flatGeometry2 = new THREE.CircleGeometry( PLANE_HEIGHT/2 ,SEGMENTS * 30);
        _self.flatGeometry2.rotateY(Math.PI / 1);
        _self.surface2 = new THREE.Mesh( _self.flatGeometry2, _self.shaderMaterial2 );
        _self.surface2.scale.set( SIDE_SCALE, SIDE_SCALE, SIDE_SCALE );
        _self.surface2.position.set( 25, -13, 1 );
    
       // LEFT SCREEN
        _self.flatGeometry3 = new THREE.CircleGeometry( PLANE_HEIGHT/2 ,SEGMENTS * 30);
        _self.surface3 = new THREE.Mesh( _self.flatGeometry3, _self.shaderMaterial2 );
        _self.surface3.scale.set( SIDE_SCALE, SIDE_SCALE, SIDE_SCALE );
        _self.surface3.position.set( -25, -13, 1 );
    

// FEEDBACK ATTEMPT





// initial texture
const plane_in = new THREE.PlaneGeometry(PLANE_HEIGHT,PLANE_HEIGHT);
// const plane_in = new THREE.CircleGeometry( PLANE_HEIGHT/2 ,50);
const uniforms_input = {
  u_in_buffer: { value: _self.textureA.texture },
  u_init_buffer: { value: initial_texture },
  u_resolution:
    { value: new THREE.Vector2(_self.width , _self.height) },
  u_time: { value: 0. },
  u_extra: { value: 0.5 },
};


material_in = new THREE.ShaderMaterial(
  { uniforms: uniforms_input, fragmentShader: fb_fragment });
  
const mesh_init = new THREE.Mesh(plane_in, material_in);
_self.in_scene.add(mesh_init);




        /**
         * A reference to the threejs scene
         * @member GlRenderer#scene
         */
        // _self.scene.add( _self.surface );
        _self.scene.add( _self.surface2 );
        _self.scene.add( _self.surface3 );
      }
    










      // ---------------------------------------------------------------------------
    
      /** @function GlRenderer.render */
      _self.render = function() {
        requestAnimationFrame( _self.render );

        // _self.glrenderer.render( _self.scene, _self.camera );
        // _self.composer.render( _self.scene, _self.camera );

// Update time
material_in.uniforms.u_time.value = clock.getElapsedTime();

// Effet amount
material_in.uniforms.u_extra.value = _self.u_extra;

// render the first scene to textureB - this is the feedback blend.
_self.glrenderer.setRenderTarget(_self.textureB);
_self.glrenderer.render(_self.in_scene, _self.cameraSquare);

// swap the textures for feedback
var t = _self.textureA;
_self.textureA = _self.textureB;
_self.textureB = t;
// update the output scene with the recently rendered texture
material_out.map = _self.textureB.texture;
// _self.surface.map = textureB.texture;

material_out.map.encoding = THREE.sRGBEncoding;

_self.glrenderer.setRenderTarget(_self.textureC);
_self.glrenderer.render(_self.in_scene_c, _self.cameraSquare);

// pass the output texture back to the input of the feedback shader
material_in.uniforms.u_in_buffer.value = _self.textureA.texture;
material_in.uniforms.u_init_buffer.value = _self.textureC.texture;
material_in.uniforms.u_resolution.value = new THREE.Vector2(_self.width , _self.width) ;


  // returns the render to using the canvas
  _self.glrenderer.setRenderTarget(null);

  // render output scene
  _self.glrenderer.render(_self.scene, _self.camera);

  // _self.glrenderer.render(_self.in_scene_c, _self.camera);



  _self.onafterrender()
  _self.glrenderer.setSize( _self.width, _self.height );

  _self.nodes.forEach( function(n) { n.update() } );

  cnt++;
  _self.customUniforms['time'].value = cnt;

        // _self.flatGeometry.rotateZ(Math.PI / 8);
        // _self.flatGeometry.rotateZ(cnt / 10000);
      }
    









      // update size!
      _self.resize = function() {
    
        // if ( _self.options.autosize ) {
        //   _self.height = window.innerHeight
        //   _self.width = window.innerWidth
        // }
        
        _self.customUniforms['screenSize'] = { type: "v2", value: new THREE.Vector2( _self.width,  _self.height ) }
        // console.log("resize", _self.width, _self.height)
        // resize viewport (write exception for width >>> height, now gives black bars )
        _self.camera.aspect = _self.width / _self.height;
        _self.camera.updateProjectionMatrix();
        _self.glrenderer.setSize( _self.width, _self.height );
        // _self.composer.setSize( _self.width, _self.height );
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
    