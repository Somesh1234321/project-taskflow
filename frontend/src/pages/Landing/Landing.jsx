import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vsSource = `
      attribute vec4 aVertexPosition;
      void main() {
          gl_Position = aVertexPosition;
      }
    `;

    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      
      float random (in vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      
      float noise (in vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      void main() {
          vec2 st = gl_FragCoord.xy / u_resolution.xy;
          vec2 mouse = u_mouse / u_resolution;
          mouse.y = 1.0 - mouse.y; 
          
          float dist = distance(st, mouse);
          float glow = smoothstep(0.8, 0.0, dist);
          
          vec2 pos = vec2(st * 3.0);
          float n = noise(pos + u_time * 0.1);
          
          vec3 bg = vec3(0.05, 0.08, 0.06); 
          vec3 emerald = vec3(0.06, 0.72, 0.5); 
          
          vec3 color = mix(bg, emerald, glow * n * 0.5);
          
          gl_FragColor = vec4(color, 1.0);
      }
    `;

    function compileShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const positions = new Float32Array([
      -1.0,  1.0,
       1.0,  1.0,
      -1.0, -1.0,
       1.0, -1.0,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    const mouseUniformLocation = gl.getUniformLocation(program, "u_mouse");
    const timeUniformLocation = gl.getUniformLocation(program, "u_time");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener('resize', resize);
    resize();

    let animationFrameId;
    const startTime = performance.now();

    function render(time) {
      if (!canvas || !gl) return;
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      gl.uniform2f(mouseUniformLocation, mouseX, mouseY);
      gl.uniform1f(timeUniformLocation, (time - startTime) * 0.001);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container relative">
      {/* WebGL Background Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-[-1] pointer-events-none opacity-40" />

      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-desktop py-4 bg-transparent backdrop-blur-lg bg-surface/10 border-b border-white/5 shadow-primary/10 transition-all duration-300">
        <div className="flex items-center gap-12">
          <div className="font-headline-lg text-headline-lg font-bold text-on-surface flex items-center gap-2">
            <img 
              alt="TaskFlow" 
              className="h-8 w-8 rounded object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCL6bm2k8BFkK0jnnChmb7Zb4B8qsV7uVsxxq0SB9ouau42Nd0vXt0dSWn4kdDvuQkhmL8EMGCskJw3z-zxU1UpuKCrm-mv-nJ4kjgW06wgo4Rl7dDfm9J-aRNZ9-UpbdDwzfIPocC8ogiIlsi7wiLza0LLy3YsZMOytwK9825V3obGXBP6-5tiMOeBCZD940pXTdlS2e2wEmWdLqivQrPBEy8ew1m3PmVYFOG_xrSJvGFBpnL0TZzJf1vxvxywWjjTUXLUCSOgXZlr" 
            />
            TaskFlow
          </div>
          <ul className="hidden md:flex gap-8">
            <li><a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors hover:scale-105 transition-transform inline-block" href="#features">Features</a></li>
            <li><a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors hover:scale-105 transition-transform inline-block" href="#solutions">Solutions</a></li>
            <li><a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors hover:scale-105 transition-transform inline-block" href="#docs">Docs</a></li>
          </ul>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">Login</Link>
          <Link to="/register" className="bg-primary-container text-black font-label-md text-label-md px-6 py-2 rounded-full hover:bg-primary transition-colors emerald-glow font-bold">Get Started</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-32 pb-24 flex flex-col items-center justify-center relative">
        {/* Hero Background Image */}
        <div 
          className="absolute top-0 left-0 w-full h-[80vh] z-0 overflow-hidden pointer-events-none opacity-30 mix-blend-screen" 
          style={{
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
          }}
        >
          <img 
            alt="" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida/AP1WRLtReNqIEctZrQT5fbOxBSYOmD9SAQuPyoFtCJU0ipCToJHKmMaCI6HMt015TaStBj7OWpQiNB-gus5VtWmLPSLJz3H1KxWLAbAaR16lsYj8HZEjSaSNv_N5F7UTwyaC4hmGGH02KoytVhX4CeWekrJ0kv4epCNYRWXmQJpRq0MO04DQlTnAjHm6DBn2m2drwdHeZ6OXpt9xfdynJBsl4ALMonPGyu04dgdoLcyP3VmyB0VeCLIwWs1T0F2t" 
          />
        </div>

        {/* Hero Section */}
        <section className="max-w-container-max mx-auto px-margin-desktop flex flex-col items-center text-center z-10 relative mt-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-surface-container-low/50 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-md text-label-md text-primary">TaskFlow 2.0 is now live</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface max-w-4xl mb-6">
            Focus on the deep work.<br />
            <span className="text-primary/90">We handle the rest.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-10">
            The high-velocity workspace designed for technical teams. Automate the noise, streamline your processes, and reclaim your deep focus blocks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
            <Link 
              to="/register" 
              className="bg-primary-container text-black font-label-md text-label-md px-8 py-4 rounded-full hover:bg-primary transition-all duration-300 emerald-glow font-bold flex items-center justify-center gap-2"
            >
              Start for free
              {/* <span className="material-symbols-outlined text-sm">arrow_forward</span> */}
            </Link>
          </div>
          <p className="font-code-sm text-code-sm text-on-surface-variant/60 mt-4">No credit card required. Free forever for individuals.</p>
        </section>

        {/* Product Preview Bento */}
        <section id="features" className="w-full max-w-container-max mx-auto px-margin-desktop mt-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mockup-container">
            {/* Main Mockup Card */}
            <div className="md:col-span-8 bg-surface-container-low rounded-xl border border-outline-variant overflow-hidden relative shadow-2xl shadow-black/50 group mockup-tilt">
              <div className="h-8 bg-surface-container border-b border-outline-variant flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-error-container"></div>
                  <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
                  <div className="w-3 h-3 rounded-full bg-primary-container"></div>
                </div>
              </div>
              <div className="p-6 relative">
                <img 
                  className="w-full h-auto rounded-lg object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" 
                  alt="A high-fidelity, dark-themed UI dashboard mockup showing an intricate project management timeline with glowing emerald progress bars, minimalist technical typography, set against a deep green-black background." 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEbFLQrXqpcB9zmKS9sp-nWRx1DqV_cuXvWc7hv08lv73JIi5nupeOU9ezPdUy6OPcgOKElUw_yBpmpVUUZ7dN6_T_TJZONvPrf7xln59nOV5DBdih6F4LJLdLYPhT_1bzSydkYcS0F52pX1r2MZ_cVQay5OBWHkseiPOKNMgEd6wbxZJiolWLtL_USP01YRkELV5ckujnc8WZUGmg0URvbyu5Z3FbIzsoW-hoqaDGqaimINcpJmpyf50OFRRfZkk1OLQM5DHGZDWi" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent"></div>
              </div>
            </div>

            {/* Bento Side Cards */}
            <div className="md:col-span-4 flex flex-col gap-gutter">
              {/* Feature Card 1 */}
              <div className="bg-surface-container-low rounded-xl border border-outline-variant p-6 flex-1 flex flex-col justify-between hover:border-primary/50 transition-colors group">
                <div>
                  <span className="material-symbols-outlined text-primary mb-4 text-3xl group-hover:scale-110 transition-transform">🔩</span>
                  <h3 className="font-headline-lg text-headline-lg text-on-surface mb-2 text-2xl">Automated Workflows</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">Trigger complex data pipelines and issue assignments with zero manual intervention.</p>
                </div>
              </div>
              {/* Feature Card 2 */}
              <div className="bg-surface-container-low rounded-xl border border-outline-variant p-6 flex-1 flex flex-col justify-between hover:border-primary/50 transition-colors group">
                <div>
                  <span className="material-symbols-outlined text-primary mb-4 text-3xl group-hover:scale-110 transition-transform">📊</span>
                  <h3 className="font-headline-lg text-headline-lg text-on-surface mb-2 text-2xl">Real-time Analytics</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">Monitor velocity, bottleneck metrics, and team bandwidth in a precise, dark-mode canvas.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section id="solutions" className="w-full mt-32 text-center relative z-10 px-margin-desktop">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-8">Trusted by engineering teams at</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <div className="h-8 w-32 bg-outline-variant/30 rounded"></div>
            <div className="h-8 w-24 bg-outline-variant/30 rounded"></div>
            <div className="h-8 w-40 bg-outline-variant/30 rounded"></div>
            <div className="h-8 w-28 bg-outline-variant/30 rounded"></div>
            <div className="h-8 w-36 bg-outline-variant/30 rounded"></div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="docs" className="w-full py-12 px-margin-desktop flex flex-col md:flex-row justify-between items-center bg-surface-container-lowest border-t border-outline-variant z-10 relative">
        <div className="font-headline-lg text-headline-lg font-bold text-on-surface flex items-center gap-2 mb-6 md:mb-0">
          <img 
            alt="TaskFlow" 
            className="h-6 w-6 rounded object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCL6bm2k8BFkK0jnnChmb7Zb4B8qsV7uVsxxq0SB9ouau42Nd0vXt0dSWn4kdDvuQkhmL8EMGCskJw3z-zxU1UpuKCrm-mv-nJ4kjgW06wgo4Rl7dDfm9J-aRNZ9-UpbdDwzfIPocC8ogiIlsi7wiLza0LLy3YsZMOytwK9825V3obGXBP6-5tiMOeBCZD940pXTdlS2e2wEmWdLqivQrPBEy8ew1m3PmVYFOG_xrSJvGFBpnL0TZzJf1vxvxywWjjTUXLUCSOgXZlr" 
          />
          TaskFlow
        </div>
        <ul className="flex flex-wrap justify-center gap-8 mb-6 md:mb-0">
          <li><a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface underline transition-opacity duration-200" href="#privacy">Privacy</a></li>
          <li><a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface underline transition-opacity duration-200" href="#terms">Terms</a></li>
          <li><a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface underline transition-opacity duration-200" href="#security">Security</a></li>
          <li><a className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface underline transition-opacity duration-200" href="#contact">Contact</a></li>
        </ul>
        <div className="font-body-md text-body-md text-on-surface-variant">
          © 2026 TaskFlow AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
