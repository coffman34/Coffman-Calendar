import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

/**
 * CollageFrame component that renders a frame image with chroma-key transparency
 * Pure black (#000000) and pure green (#00FF00) pixels are made transparent
 */
const CollageFrame = ({ src, sx = {} }) => {
    const canvasRef = useRef(null);
    const imageRef = useRef(null);

    useEffect(() => {
        if (!src) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Set canvas size to match image
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the image
            ctx.drawImage(img, 0, 0);

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Process each pixel
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Check for pure black (0, 0, 0) or pure green (0, 255, 0)
                const isBlack = r === 0 && g === 0 && b === 0;
                const isGreen = r === 0 && g === 255 && b === 0;

                // Make pixel transparent
                if (isBlack || isGreen) {
                    data[i + 3] = 0; // Set alpha to 0 (transparent)
                }
            }

            // Put the modified image data back
            ctx.putImageData(imageData, 0, 0);
        };

        img.crossOrigin = 'anonymous';
        img.src = src;
        imageRef.current = img;

    }, [src]);

    return (
        <Box
            component="canvas"
            ref={canvasRef}
            sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 2,
                ...sx
            }}
        />
    );
};

export default CollageFrame;
