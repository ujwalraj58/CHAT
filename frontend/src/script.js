// file: frontend/src/App.jsx

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const canvasRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.position.z = 55;

    // Glass sphere
    const sphereGeometry = new THREE.SphereGeometry(10, 64, 64);
    const sphereMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x00ffff,
      transparent: true,
      transmission: 1.0,
      opacity: 0.6,
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      reflectivity: 0.9,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    // Glow
    const glowGeometry = new THREE.SphereGeometry(10.5, 64, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x6b5bff,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);

    // Orbiting lights
    const particles = [];
    const particleGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < 20; i++) {
      const p = new THREE.Mesh(particleGeo, particleMat);
      p.orbitRadius = 13 + Math.random() * 3;
      p.orbitSpeed = 0.002 + Math.random() * 0.005;
      p.orbitAngle = Math.random() * Math.PI * 2;
      particles.push(p);
      scene.add(p);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    const pointLight = new THREE.PointLight(0x88ffff, 2, 150);
    pointLight.position.set(50, 60, 90);
    scene.add(ambientLight, pointLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Sphere motion
      sphere.rotation.y += 0.004;
      sphere.position.y = Math.sin(t * 1.5) * 1.5;
      glow.position.copy(sphere.position);

      // Animate orbiting particles
      particles.forEach((p, i) => {
        p.orbitAngle += p.orbitSpeed;
        p.position.x = Math.cos(p.orbitAngle) * p.orbitRadius;
        p.position.z = Math.sin(p.orbitAngle) * p.orbitRadius;
        p.position.y = Math.sin(p.orbitAngle * 2 + i) * 0.4;
      });

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }, []);

  const typeResponse = (text) => {
    let index = 0;
    const chars = text.split("");
    let temp = "";
    typingTimeout.current = setInterval(() => {
      temp += chars[index];
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { type: "bot", text: temp };
        return updated;
      });
      index++;
      if (index >= chars.length) clearInterval(typingTimeout.current);
    }, 25);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages((prev) => [...prev, { type: "user", text: userText }, { type: "bot", text: "" }]);
    setInput("");
    setTimeout(() => {
      typeResponse(`You said: "${userText}" (Simulated)`);
    }, 500);
  };

  return (
    <div className="flex flex-col h-screen relative overflow-hidden text-white">
      <div className="absolute inset-0 -z-10">
        <canvas ref={canvasRef} id="three-bg" className="w-full h-full" />
      </div>

      <header className="flex items-center gap-3 px-6 py-4 z-10 backdrop-blur-md bg-black/30 border-b border-white/10 shadow text-xl font-bold">
        <div className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-600 text-2xl font-extrabold tracking-tight">
          C<span className="text-white">GPT</span>
        </div>
        <span className="text-sm text-white/60">College GPT</span>
      </header>

      <ScrollArea className="flex-1 overflow-auto px-6 py-6 space-y-6 z-10">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card
                className={`max-w-fit ${
                  msg.type === "user" ? "ml-auto bg-white/10" : "bg-white/5"
                } text-white backdrop-blur-md border border-white/10 rounded-xl`}
              >
                <CardContent className="p-4 whitespace-pre-wrap">
                  {msg.text}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </ScrollArea>

      <div className="p-4 z-10 bg-black/30 backdrop-blur-xl border-t border-white/10 flex gap-2 items-center">
        <Input
          className="flex-1 bg-white/10 text-white placeholder:text-white/50 border border-white/20 backdrop-blur-md rounded-full px-6"
          value={input}
          placeholder="Type message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button
          className="rounded-full px-4 py-2 bg-white/10 border border-white/20 text-white hover:bg-white/20"
          onClick={sendMessage}
        >
          <Send className="w-4 h-4 mr-1" />
        </Button>
      </div>
    </div>
  );
}
