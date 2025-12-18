// Liquid Effect Implementation
// This script adds a transparent liquid effect to all pages

(function() {
    // Check if liquid effect is already initialized
    if (window.__liquidEffectInitialized) return;
    
    // Create a style element for the liquid effect
    const style = document.createElement('style');
    style.textContent = `
        .liquid-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: -1;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
    
    // Function to initialize liquid effect
    function initLiquidEffect() {
        // Create canvas element
        const canvas = document.createElement('canvas');
        canvas.className = 'liquid-canvas';
        canvas.id = 'liquid-canvas';
        
        // Insert canvas at the beginning of body
        document.body.insertBefore(canvas, document.body.firstChild);
        
        // Dynamically load the liquid effect library
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
            import LiquidBackground from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.22/build/backgrounds/liquid1.min.js';
            
            const canvas = document.getElementById('liquid-canvas');
            if (canvas) {
                const app = LiquidBackground(canvas);
                app.loadImage('https://i.pinimg.com/1200x/38/71/c9/3871c9c7a6066df6763c97dc3285c907.jpg');
                app.liquidPlane.material.metalness = 0.75;
                app.liquidPlane.material.roughness = 0.25;
                app.liquidPlane.uniforms.displacementScale.value = window.innerWidth < 768 ? 3 : 5;
                app.setRain(false);
                
                // Handle resize for mobile
                function handleResize() {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                    app.liquidPlane.uniforms.displacementScale.value = window.innerWidth < 768 ? 3 : 5;
                }
                
                window.addEventListener('resize', handleResize);
                handleResize(); // Initial sizing
                window.__liquidApp = app;
            }
        `;
        
        document.body.appendChild(script);
        
        // Mark as initialized
        window.__liquidEffectInitialized = true;
    }
    
    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLiquidEffect);
    } else {
        initLiquidEffect();
    }
    
    // Cleanup function
    window.addEventListener('beforeunload', function() {
        if (window.__liquidApp && window.__liquidApp.dispose) {
            window.__liquidApp.dispose();
        }
    });
})();