import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ModelViewer = () => {
  const mountRef = useRef(null); // Ref to attach the renderer
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    // Copy the current value of the ref to a local variable.
    const mount = mountRef.current;
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75, // Field of view
      mount.clientWidth / mount.clientHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );
    camera.position.z = 2; // Position camera to view the model

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement); // Attach renderer to DOM

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 4.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 4.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Load the GLB model
    const loader = new GLTFLoader();
    let model; // To reference the loaded model in animation
    loader.load(
      '/model.glb', // Ensure this path is correct (e.g., in public folder)
      (gltf) => {
        model = gltf.scene;
        scene.add(model);
        setIsLoading(false); // Model loaded, hide loading state
      },
      undefined, // Progress callback (optional)
      (error) => {
        console.error('Error loading GLB model:', error);
        setIsLoading(false); // Handle error case
      }
    );

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (model) {
        model.rotation.y += delta; // Rotate model on y-axis
      }
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resizing
    const handleResize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.remove(model); // Remove model from scene
    };
  }, []); // Runs once on mount

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >

{isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#fff'
        }}>
          
        </div>
      )}

    </div>
  );
};

export default ModelViewer;
