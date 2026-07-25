class SplashCursor {
  constructor(options = {}) {
    this.config = {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 1440,
      CAPTURE_RESOLUTION: 512,
      DENSITY_DISSIPATION: 3.5,
      VELOCITY_DISSIPATION: 2,
      PRESSURE: 0.1,
      PRESSURE_ITERATIONS: 20,
      CURL: 3,
      SPLAT_RADIUS: 0.2,
      SPLAT_FORCE: 6000,
      SHADING: true,
      COLOR_UPDATE_SPEED: 10,
      BACK_COLOR: { r: 0.5, g: 0, b: 0 },
      TRANSPARENT: true,
      RAINBOW_MODE: true,
      COLOR: '#ff0000',
      ...options
    };

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'fluid';
    Object.assign(this.canvas.style, {
      width: '100vw',
      height: '100vh',
      display: 'block',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 50,
      pointerEvents: 'none'
    });
    document.body.appendChild(this.canvas);

    this.init();
  }

  init() {
    const { gl, ext } = this.getWebGLContext(this.canvas);
    this.gl = gl;
    this.ext = ext;

    if (!ext.supportLinearFiltering) {
      this.config.DYE_RESOLUTION = 256;
      this.config.SHADING = false;
    }

    this.pointers = [{
      id: -1,
      texcoordX: 0,
      texcoordY: 0,
      prevTexcoordX: 0,
      prevTexcoordY: 0,
      deltaX: 0,
      deltaY: 0,
      down: false,
      moved: false,
      color: [0, 0, 0]
    }];

    this.initShaders();
    this.initFramebuffers();
    this.updateKeywords();
    
    this.lastUpdateTime = Date.now();
    this.colorUpdateTimer = 0.0;
    this.firstMouseMoveHandled = false;

    this.bindEvents();
    this.updateFrame();
  }

  getWebGLContext(canvas) {
    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    let gl = canvas.getContext('webgl2', params);
    const isWebGL2 = !!gl;
    if (!isWebGL2) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);

    let halfFloat;
    let supportLinearFiltering;
    if (isWebGL2) {
      gl.getExtension('EXT_color_buffer_float');
      supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
    } else {
      halfFloat = gl.getExtension('OES_texture_half_float');
      supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
    }

    const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat && halfFloat.HALF_FLOAT_OES;
    let formatRGBA, formatRG, formatR;

    const getSupportedFormat = (gl, internalFormat, format, type) => {
      if (!this.supportRenderTextureFormat(gl, internalFormat, format, type)) {
        switch (internalFormat) {
          case gl.R16F: return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
          case gl.RG16F: return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
          default: return null;
        }
      }
      return { internalFormat, format };
    };

    if (isWebGL2) {
      formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
      formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
      formatR = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
    } else {
      formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    }

    return { gl, ext: { formatRGBA, formatRG, formatR, halfFloatTexType, supportLinearFiltering } };
  }

  supportRenderTextureFormat(gl, internalFormat, format, type) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  }

  initShaders() {
    const gl = this.gl;
    const compileShader = (type, source, keywords) => {
      if (keywords) {
        let keywordsString = '';
        keywords.forEach(k => keywordsString += '#define ' + k + '\n');
        source = keywordsString + source;
      }
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const createProgram = (vsSource, fsSource, keywords) => {
      const vs = compileShader(gl.VERTEX_SHADER, vsSource);
      const fs = compileShader(gl.FRAGMENT_SHADER, fsSource, keywords);
      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      const uniforms = {};
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < count; i++) {
        const name = gl.getActiveUniform(program, i).name;
        uniforms[name] = gl.getUniformLocation(program, name);
      }
      return { program, uniforms, bind: () => gl.useProgram(program) };
    };

    const baseVertexShader = `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;
      void main () {
          vUv = aPosition * 0.5 + 0.5;
          vL = vUv - vec2(texelSize.x, 0.0);
          vR = vUv + vec2(texelSize.x, 0.0);
          vT = vUv + vec2(0.0, texelSize.y);
          vB = vUv - vec2(0.0, texelSize.y);
          gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    this.copyProgram = createProgram(baseVertexShader, `
      precision mediump float;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      void main () { gl_FragColor = texture2D(uTexture, vUv); }
    `);

    this.clearProgram = createProgram(baseVertexShader, `
      precision mediump float;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
      void main () { gl_FragColor = value * texture2D(uTexture, vUv); }
    `);

    this.splatProgram = createProgram(baseVertexShader, `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
      void main () {
          vec2 p = vUv - point.xy;
          p.x *= aspectRatio;
          vec3 splat = exp(-dot(p, p) / radius) * color;
          vec3 base = texture2D(uTarget, vUv).xyz;
          gl_FragColor = vec4(base + splat, 1.0);
      }
    `);

    this.advectionProgram = createProgram(baseVertexShader, `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform vec2 dyeTexelSize;
      uniform float dt;
      uniform float dissipation;
      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
          vec2 st = uv / tsize - 0.5;
          vec2 iuv = floor(st);
          vec2 fuv = fract(st);
          vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
          vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
          vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
          vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
          return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }
      void main () {
          #ifdef MANUAL_FILTERING
              vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
              vec4 result = bilerp(uSource, coord, dyeTexelSize);
          #else
              vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
              vec4 result = texture2D(uSource, coord);
          #endif
          gl_FragColor = result / (1.0 + dissipation * dt);
      }
    `, this.ext.supportLinearFiltering ? null : ['MANUAL_FILTERING']);

    this.divergenceProgram = createProgram(baseVertexShader, `
      precision mediump float;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
          float L = texture2D(uVelocity, vL).x;
          float R = texture2D(uVelocity, vR).x;
          float T = texture2D(uVelocity, vT).y;
          float B = texture2D(uVelocity, vB).y;
          vec2 C = texture2D(uVelocity, vUv).xy;
          if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x;
          if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y;
          gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
      }
    `);

    this.curlProgram = createProgram(baseVertexShader, `
      precision mediump float;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
          float L = texture2D(uVelocity, vL).y;
          float R = texture2D(uVelocity, vR).y;
          float T = texture2D(uVelocity, vT).x;
          float B = texture2D(uVelocity, vB).x;
          gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
      }
    `);

    this.vorticityProgram = createProgram(baseVertexShader, `
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;
      void main () {
          float L = texture2D(uCurl, vL).x; float R = texture2D(uCurl, vR).x;
          float T = texture2D(uCurl, vT).x; float B = texture2D(uCurl, vB).x;
          float C = texture2D(uCurl, vUv).x;
          vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
          force /= length(force) + 0.0001;
          force *= curl * C; force.y *= -1.0;
          gl_FragColor = vec4(texture2D(uVelocity, vUv).xy + force * dt, 0.0, 1.0);
      }
    `);

    this.pressureProgram = createProgram(baseVertexShader, `
      precision mediump float;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      void main () {
          float L = texture2D(uPressure, vL).x; float R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).x; float B = texture2D(uPressure, vB).x;
          float divergence = texture2D(uDivergence, vUv).x;
          gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
      }
    `);

    this.gradienSubtractProgram = createProgram(baseVertexShader, `
      precision mediump float;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      void main () {
          float L = texture2D(uPressure, vL).x; float R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).x; float B = texture2D(uPressure, vB).x;
          vec2 velocity = texture2D(uVelocity, vUv).xy;
          gl_FragColor = vec4(velocity - vec2(R - L, T - B), 0.0, 1.0);
      }
    `);

    this.displayShaderSource = `
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform vec2 texelSize;
      void main () {
          vec3 c = texture2D(uTexture, vUv).rgb;
          #ifdef SHADING
              float dx = length(texture2D(uTexture, vR).rgb) - length(texture2D(uTexture, vL).rgb);
              float dy = length(texture2D(uTexture, vT).rgb) - length(texture2D(uTexture, vB).rgb);
              vec3 n = normalize(vec3(dx, dy, length(texelSize)));
              c *= clamp(dot(n, vec3(0, 0, 1)) + 0.7, 0.7, 1.0);
          #endif
          gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)));
      }
    `;

    this.blit = (() => {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);
      return (target, clear = false) => {
        if (target == null) {
          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        } else {
          gl.viewport(0, 0, target.width, target.height);
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        }
        if (clear) { gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      };
    })();
  }

  initFramebuffers() {
    const gl = this.gl;
    const createFBO = (w, h, internalFormat, format, type, param) => {
      gl.activeTexture(gl.TEXTURE0);
      let texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
      let fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { texture, fbo, width: w, height: h, texelSizeX: 1/w, texelSizeY: 1/h, attach: (id) => { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, texture); return id; }};
    };
    const createDoubleFBO = (w, h, i, f, t, p) => {
      let f1 = createFBO(w, h, i, f, t, p), f2 = createFBO(w, h, i, f, t, p);
      return { width: w, height: h, texelSizeX: f1.texelSizeX, texelSizeY: f1.texelSizeY, read: f1, write: f2, swap: function() { let tmp = this.read; this.read = this.write; this.write = tmp; }};
    };

    const res = (r) => {
      let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
      if (aspect < 1) aspect = 1 / aspect;
      const min = Math.round(r), max = Math.round(r * aspect);
      return gl.drawingBufferWidth > gl.drawingBufferHeight ? { w: max, h: min } : { w: min, h: max };
    };

    const simRes = res(this.config.SIM_RESOLUTION), dyeRes = res(this.config.DYE_RESOLUTION);
    const ext = this.ext, filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
    
    this.dye = createDoubleFBO(dyeRes.w, dyeRes.h, ext.formatRGBA.internalFormat, ext.formatRGBA.format, ext.halfFloatTexType, filtering);
    this.velocity = createDoubleFBO(simRes.w, simRes.h, ext.formatRG.internalFormat, ext.formatRG.format, ext.halfFloatTexType, filtering);
    this.divergence = createFBO(simRes.w, simRes.h, ext.formatR.internalFormat, ext.formatR.format, ext.halfFloatTexType, gl.NEAREST);
    this.curl = createFBO(simRes.w, simRes.h, ext.formatR.internalFormat, ext.formatR.format, ext.halfFloatTexType, gl.NEAREST);
    this.pressure = createDoubleFBO(simRes.w, simRes.h, ext.formatR.internalFormat, ext.formatR.format, ext.halfFloatTexType, gl.NEAREST);
  }

  updateKeywords() {
    const displayKeywords = this.config.SHADING ? ['SHADING'] : [];
    const gl = this.gl;
    const vs = this.gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, `precision highp float; attribute vec2 aPosition; varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB; uniform vec2 texelSize; void main () { vUv = aPosition * 0.5 + 0.5; vL = vUv - vec2(texelSize.x, 0.0); vR = vUv + vec2(texelSize.x, 0.0); vT = vUv + vec2(0.0, texelSize.y); vB = vUv - vec2(0.0, texelSize.y); gl_Position = vec4(aPosition, 0.0, 1.0); }`);
    gl.compileShader(vs);

    let src = this.displayShaderSource;
    displayKeywords.forEach(k => src = '#define ' + k + '\n' + src);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, src);
    gl.compileShader(fs);

    this.displayProgram = gl.createProgram();
    gl.attachShader(this.displayProgram, vs);
    gl.attachShader(this.displayProgram, fs);
    gl.linkProgram(this.displayProgram);
    
    this.displayUniforms = {};
    const count = gl.getProgramParameter(this.displayProgram, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const name = gl.getActiveUniform(this.displayProgram, i).name;
      this.displayUniforms[name] = gl.getUniformLocation(this.displayProgram, name);
    }
  }

  bindEvents() {
    const scale = (v) => v * (window.devicePixelRatio || 1);
    const updatePointerDown = (p, id, x, y) => {
      p.id = id; p.down = true; p.moved = false; p.texcoordX = x / this.canvas.width; p.texcoordY = 1 - y / this.canvas.height;
      p.prevTexcoordX = p.texcoordX; p.prevTexcoordY = p.texcoordY; p.deltaX = 0; p.deltaY = 0; p.color = this.generateColor();
    };
    const updatePointerMove = (p, x, y) => {
      p.prevTexcoordX = p.texcoordX; p.prevTexcoordY = p.texcoordY; p.texcoordX = x / this.canvas.width; p.texcoordY = 1 - y / this.canvas.height;
      let dx = p.texcoordX - p.prevTexcoordX, dy = p.texcoordY - p.prevTexcoordY;
      let aspect = this.canvas.width / this.canvas.height;
      if (aspect < 1) dx *= aspect; else dy /= aspect;
      p.deltaX = dx; p.deltaY = dy; p.moved = Math.abs(dx) > 0 || Math.abs(dy) > 0;
    };

    window.addEventListener('mousedown', e => {
      updatePointerDown(this.pointers[0], -1, scale(e.clientX), scale(e.clientY));
      this.splat(this.pointers[0].texcoordX, this.pointers[0].texcoordY, 10*(Math.random()-0.5), 30*(Math.random()-0.5), this.generateColor());
    });
    window.addEventListener('mousemove', e => {
      if (!this.firstMouseMoveHandled) { updatePointerDown(this.pointers[0], -1, scale(e.clientX), scale(e.clientY)); this.firstMouseMoveHandled = true; }
      updatePointerMove(this.pointers[0], scale(e.clientX), scale(e.clientY));
    });
    window.addEventListener('touchstart', e => {
      const t = e.targetTouches[0];
      updatePointerDown(this.pointers[0], t.identifier, scale(t.clientX), scale(t.clientY));
    });
    window.addEventListener('touchmove', e => {
      const t = e.targetTouches[0];
      updatePointerMove(this.pointers[0], scale(t.clientX), scale(t.clientY));
    }, { passive: false });
    window.addEventListener('touchend', () => this.pointers[0].down = false);
  }

  generateColor() {
    if (!this.config.RAINBOW_MODE) {
      let hex = this.config.COLOR.replace('#', '');
      if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
      return { r: parseInt(hex.slice(0,2),16)/255*0.15, g: parseInt(hex.slice(2,4),16)/255*0.15, b: parseInt(hex.slice(4,6),16)/255*0.15 };
    }
    const h = Math.random(), s = 1.0, v = 1.0;
    let r, g, b, i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break; case 1: r = q; g = v; b = p; break; case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break; case 4: r = t; g = p; b = v; break; case 5: r = v; g = p; b = q; break;
    }
    return { r: r * 0.15, g: g * 0.15, b: b * 0.15 };
  }

  splat(x, y, dx, dy, color) {
    const gl = this.gl;
    this.splatProgram.bind();
    gl.uniform1i(this.splatProgram.uniforms.uTarget, this.velocity.read.attach(0));
    gl.uniform1f(this.splatProgram.uniforms.aspectRatio, this.canvas.width / this.canvas.height);
    gl.uniform2f(this.splatProgram.uniforms.point, x, y);
    gl.uniform3f(this.splatProgram.uniforms.color, dx, dy, 0.0);
    let radius = this.config.SPLAT_RADIUS / 100.0;
    if (this.canvas.width/this.canvas.height > 1) radius *= this.canvas.width/this.canvas.height;
    gl.uniform1f(this.splatProgram.uniforms.radius, radius);
    this.blit(this.velocity.write); this.velocity.swap();

    gl.uniform1i(this.splatProgram.uniforms.uTarget, this.dye.read.attach(0));
    gl.uniform3f(this.splatProgram.uniforms.color, color.r, color.g, color.b);
    this.blit(this.dye.write); this.dye.swap();
  }

  updateFrame() {
    const gl = this.gl, dt = Math.min((Date.now() - this.lastUpdateTime) / 1000, 0.016666);
    this.lastUpdateTime = Date.now();

    const w = Math.floor(this.canvas.clientWidth * (window.devicePixelRatio || 1)), h = Math.floor(this.canvas.clientHeight * (window.devicePixelRatio || 1));
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; this.initFramebuffers(); }

    this.colorUpdateTimer += dt * this.config.COLOR_UPDATE_SPEED;
    if (this.colorUpdateTimer >= 1) { this.colorUpdateTimer %= 1; this.pointers.forEach(p => p.color = this.generateColor()); }

    this.pointers.forEach(p => { if (p.moved) { p.moved = false; this.splat(p.texcoordX, p.texcoordY, p.deltaX * this.config.SPLAT_FORCE, p.deltaY * this.config.SPLAT_FORCE, p.color); }});

    gl.disable(gl.BLEND);
    this.curlProgram.bind();
    gl.uniform2f(this.curlProgram.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.curlProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blit(this.curl);

    this.vorticityProgram.bind();
    gl.uniform2f(this.vorticityProgram.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.vorticityProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(this.vorticityProgram.uniforms.uCurl, this.curl.attach(1));
    gl.uniform1f(this.vorticityProgram.uniforms.curl, this.config.CURL);
    gl.uniform1f(this.vorticityProgram.uniforms.dt, dt);
    this.blit(this.velocity.write); this.velocity.swap();

    this.divergenceProgram.bind();
    gl.uniform2f(this.divergenceProgram.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.divergenceProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blit(this.divergence);

    this.clearProgram.bind();
    gl.uniform1i(this.clearProgram.uniforms.uTexture, this.pressure.read.attach(0));
    gl.uniform1f(this.clearProgram.uniforms.value, this.config.PRESSURE);
    this.blit(this.pressure.write); this.pressure.swap();

    this.pressureProgram.bind();
    gl.uniform2f(this.pressureProgram.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.pressureProgram.uniforms.uDivergence, this.divergence.attach(0));
    for (let i = 0; i < this.config.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(this.pressureProgram.uniforms.uPressure, this.pressure.read.attach(1));
      this.blit(this.pressure.write); this.pressure.swap();
    }

    this.gradienSubtractProgram.bind();
    gl.uniform2f(this.gradienSubtractProgram.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.gradienSubtractProgram.uniforms.uPressure, this.pressure.read.attach(0));
    gl.uniform1i(this.gradienSubtractProgram.uniforms.uVelocity, this.velocity.read.attach(1));
    this.blit(this.velocity.write); this.velocity.swap();

    this.advectionProgram.bind();
    gl.uniform2f(this.advectionProgram.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    if (!this.ext.supportLinearFiltering) gl.uniform2f(this.advectionProgram.uniforms.dyeTexelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    let vid = this.velocity.read.attach(0);
    gl.uniform1i(this.advectionProgram.uniforms.uVelocity, vid);
    gl.uniform1i(this.advectionProgram.uniforms.uSource, vid);
    gl.uniform1f(this.advectionProgram.uniforms.dt, dt);
    gl.uniform1f(this.advectionProgram.uniforms.dissipation, this.config.VELOCITY_DISSIPATION);
    this.blit(this.velocity.write); this.velocity.swap();

    if (!this.ext.supportLinearFiltering) gl.uniform2f(this.advectionProgram.uniforms.dyeTexelSize, this.dye.texelSizeX, this.dye.texelSizeY);
    gl.uniform1i(this.advectionProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(this.advectionProgram.uniforms.uSource, this.dye.read.attach(1));
    gl.uniform1f(this.advectionProgram.uniforms.dissipation, this.config.DENSITY_DISSIPATION);
    this.blit(this.dye.write); this.dye.swap();

    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.useProgram(this.displayProgram);
    if (this.config.SHADING) gl.uniform2f(this.displayUniforms.texelSize, 1/this.canvas.width, 1/this.canvas.height);
    gl.uniform1i(this.displayUniforms.uTexture, this.dye.read.attach(0));
    this.blit(null);

    requestAnimationFrame(() => this.updateFrame());
  }
}

// Para usarlo:
// new SplashCursor();
