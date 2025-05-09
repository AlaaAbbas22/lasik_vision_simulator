import './App.css'
import React from 'react'
import { useState, useRef, useEffect } from 'react'
import viteLogo from './assets/o6jiyz8s.png'
import './tooltip.css' // We'll create this file for tooltip styles

function App() {
    const [blurAmount, setBlurAmount] = useState(0)
    const [blurAmount2, setBlurAmount2] = useState(0)
    const canvasRefs = [useRef(null), useRef(null), useRef(null)]
    const imgRef = useRef(null)

    // Existing useEffect hooks remain unchanged
    useEffect(() => {
        const img = new Image()
        img.src = viteLogo
        img.onload = () => {
            imgRef.current = img
            renderImages()
        }
    }, [])

    useEffect(() => {
        if (imgRef.current) {
            renderImages()
        }
    }, [blurAmount, blurAmount2])

    // Existing rendering functions remain unchanged
    const renderImages = () => {
        if (!imgRef.current) return
        const direction1 = blurAmount <= 0 ? 'bottom-to-top' : 'top-to-bottom'
        // Render uncorrected image with gradient blur (always bottom-to-top for nearsightedness)
        renderGradientBlurImage(canvasRefs[0].current, Math.abs(blurAmount), direction1)
        
        // Render corrected image with gradient blur (direction based on combined value)
        const combinedBlur = blurAmount + blurAmount2
        const direction = combinedBlur <= 0 ? 'bottom-to-top' : 'top-to-bottom'
        renderGradientBlurImage(canvasRefs[1].current, Math.abs(combinedBlur), direction)
        
        // Render clear image
        renderGradientBlurImage(canvasRefs[2].current, 0, 'none')
    }

    const renderGradientBlurImage = (canvas, maxBlur, direction) => {
        if (!canvas || !imgRef.current) return
    
        const ctx = canvas.getContext('2d')
        const img = imgRef.current
        
        // Set canvas dimensions to match image
        canvas.width = img.width
        canvas.height = img.height
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Draw the base image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        if (maxBlur === 0 || direction === 'none') return;
        
        // Apply gradient blur effect
        const width = canvas.width
        const height = canvas.height
        
        // Number of blur steps for gradient
        const steps = 10
        
        // Apply gradient blur based on direction
        for (let i = 0; i < steps; i++) {
            let blurLevel;
            
            if (direction === 'bottom-to-top') {
                // More blur at bottom, less at top (for nearsightedness)
                blurLevel = ((steps - i) / steps) * maxBlur;
            } else {
                // More blur at top, less at bottom
                blurLevel = (i / steps) * maxBlur;
            }
            
            const yStart = Math.floor((i / steps) * height)
            const yEnd = Math.floor(((i + 1) / steps) * height)
            
            // Create a temporary canvas for this blur level
            const blurCanvas = document.createElement('canvas')
            blurCanvas.width = width
            blurCanvas.height = height
            const blurCtx = blurCanvas.getContext('2d')
            
            // Draw original image
            blurCtx.drawImage(img, 0, 0, width, height)
            
            // Apply blur filter if blur level > 0
            if (blurLevel > 0) {
                blurCtx.filter = `blur(${blurLevel}px)`
                blurCtx.drawImage(img, 0, 0, width, height)
            }
            
            // Copy just the relevant strip to the main canvas
            ctx.drawImage(
                blurCanvas, 
                0, yStart, width, yEnd - yStart,
                0, yStart, width, yEnd - yStart
            )
        }
    }

    // Custom tooltip component with darker background-friendly colors
    const Tooltip = ({ children, content, backgroundColor = 'bg-blue-800' }) => {
        return (
            <span className={`tooltip-container ${backgroundColor}  decoration-dotted decoration-2 text-white`}>
                {children}
                <span className="tooltip-content">{content}</span>
            </span>
        );
    };

    return (
        <div className="container mx-auto p-8 max-w-6xl">  
            <h1 className="text-4xl font-bold text-center mb-10 text-white">Vision Corrector</h1>
            
            <div className="text-center mb-10 text-gray-200">
                {blurAmount > 0 ? 
                    <div className="text-xl">
                        <Tooltip 
                            content="Farsightedness (hyperopia) occurs when light focuses behind the retina instead of directly on it. This happens when the eyeball is too short or the cornea is too flat."
                            backgroundColor="bg-amber-800"
                        >
                            Farsighted
                        </Tooltip> : You see near objects blurry
                    </div> : 
                    <div className="text-xl">
                        <Tooltip 
                            content="Nearsightedness (myopia) occurs when light focuses in front of the retina instead of directly on it. This happens when the eyeball is too long or the cornea is too curved."
                            backgroundColor="bg-blue-800"
                        >
                            Nearsighted
                        </Tooltip> : You see far objects blurry
                    </div>
                }
            </div>
            
            <div className='w-[700px] mx-auto mb-12 space-y-6'>
                <div className="mb-6">
                    <label className="block mb-3 text-gray-200 text-lg">
                        Your Prescription: {blurAmount.toFixed(2)} &nbsp;
                        <Tooltip 
                            content="Diopters (D) are units that measure the optical power of a lens. Positive values indicate farsightedness, negative values indicate nearsightedness. The higher the absolute value, the stronger the correction needed."
                            backgroundColor="bg-green-800"
                        >
                            Diopters
                        </Tooltip>
                    </label>
                    <p className="text-gray-400 mb-3">
                        (Meaning your eye is {Math.abs(blurAmount).toFixed(2)} power units {blurAmount > 0 ? "below" : "above"} normal.)
                    </p>
                    <input 
                        type="range" 
                        min="-6" 
                        max="6" 
                        value={blurAmount} 
                        onChange={(e) => setBlurAmount(parseFloat(e.target.value))}
                        step="0.01"
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                
                <div className="mb-6">
                    <label className="block mb-3 text-gray-200 text-lg">
                        <Tooltip 
                            content="The correction applied by glasses or contact lenses to compensate for vision defects. Ideally, this should be equal and opposite to your prescription."
                            backgroundColor="bg-purple-800"
                        >
                            Actual Correction
                        </Tooltip> : {-blurAmount2.toFixed(2)}
                    </label>
                    <p className="text-gray-400 mb-3">
                        (Perfect correction would be {(blurAmount).toFixed(2)})
                    </p>
                    <input 
                        type="range" 
                        min="-6" 
                        max="6" 
                        value={-blurAmount2} 
                        onChange={(e) => setBlurAmount2(parseFloat(-e.target.value))}
                        step="0.01"
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>
            <div className='grid grid-cols-3 gap-4'>
                <div>
                    <h2 className="text-gray-200 mb-2">What you currently see</h2>
                    <canvas 
                        ref={canvasRefs[0]} 
                        className="w-full rounded border border-gray-700"
                        style={{ display: 'block' }}
                    />
                </div>
                <div>
                    <h2 className="text-gray-200 mb-2">What you see after correction</h2>
                    <canvas 
                        ref={canvasRefs[1]} 
                        className="w-full rounded border border-gray-700"
                        style={{ display: 'block' }}
                    />
                </div>
                <div>
                    <h2 className="text-gray-200 mb-2">Normal person vision</h2>
                    <canvas 
                        ref={canvasRefs[2]} 
                        className="w-full rounded border border-gray-700"
                        style={{ display: 'block' }}
                    />
                </div>
            </div>
            
            <div className="text-center text-base text-gray-400 mt-12 max-w-2xl mx-auto leading-relaxed">
                <p className="mb-4">
                    <Tooltip 
                        content="The process of focusing light on the retina. In refractive errors, light rays don't focus properly on the retina, causing blurred vision."
                        backgroundColor="bg-yellow-800"
                    >
                        Refraction
                    </Tooltip> is the bending of light as it passes from one medium to another. 
                </p>
                <p>
                    Vision problems occur when the &nbsp;
                    <Tooltip 
                        content="The eye's focusing power depends on the cornea's curvature, lens flexibility, and eyeball length. When these are not in perfect proportion, refractive errors occur."
                        backgroundColor="bg-pink-800"
                    >
                        optical system
                    </Tooltip> of the eye cannot focus light correctly on the retina.
                </p>
            </div>
        </div>
    )
}

export default App