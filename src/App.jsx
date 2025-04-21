import './App.css'
import React from 'react'
import { useState, useRef, useEffect } from 'react'
import viteLogo from './assets/o6jiyz8s.png'

function App() {
    const [blurAmount, setBlurAmount] = useState(0)
    const [blurAmount2, setBlurAmount2] = useState(0)
    const canvasRefs = [useRef(null), useRef(null), useRef(null)]
    const imgRef = useRef(null)

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
                0, yStart, width, yEnd - yStart,  // Source rectangle
                0, yStart, width, yEnd - yStart   // Destination rectangle
            )
        }
    }

    return (
        <>  

            <h1>Vision Corrector</h1>
            {blurAmount>0?<div>Farsighted: You see near objects blurry</div>:<div>Nearsighted: You see far objects blurry</div>}
            <div className='w-[700px] mx-auto'>
                <label>Your Prescription {blurAmount} Diopters (Meaning your eye is {blurAmount} power units away from normal.)</label>
                <input 
                    type="range" 
                    min="-10" 
                    max="10" 
                    value={blurAmount} 
                    onChange={(e) => setBlurAmount(parseFloat(e.target.value))}
                    step="0.01"
                    className="w-full"
                />
                <label>Actual Correction {blurAmount2}</label>
                <input 
                    type="range" 
                    min="-10" 
                    max="10" 
                    value={blurAmount2} 
                    onChange={(e) => setBlurAmount2(parseFloat(e.target.value))}
                    step="0.01"
                    className="w-full"
                />
            </div>
            <div className='grid grid-cols-3'>
                <div>
                    <h2>What you currently see</h2>
                    <canvas 
                        ref={canvasRefs[0]} 
                        className="w-full"
                        style={{ display: 'block' }}
                    />
                </div>
                <div>
                    <h2>What you see after correction</h2>
                    <canvas 
                        ref={canvasRefs[1]} 
                        className="w-full"
                        style={{ display: 'block' }}
                    />
                </div>
                <div>
                    <h2>Normal person vision</h2>
                    <canvas 
                        ref={canvasRefs[2]} 
                        className="w-full"
                        style={{ display: 'block' }}
                    />
                </div>
            </div>
            
        </>
    )
}

export default App