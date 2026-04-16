import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const FlyToCartAnimation = ({ productId, productImage, isActive, onComplete }) => {
  const cloneRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isActive || !productImage) return;

    // Get product image element
    const productImg = document.querySelector(`[data-product-img="${productId}"]`);
    const cartIcon = document.querySelector('[data-cart-icon]');

    if (!productImg || !cartIcon) {
      onComplete?.();
      return;
    }

    // Clone the product image
    const clone = productImg.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.zIndex = '9999';
    clone.style.pointerEvents = 'none';
    clone.style.transition = 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    clone.style.borderRadius = '8px';
    clone.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
    
    document.body.appendChild(clone);
    cloneRef.current = clone;

    // Get positions
    const startRect = productImg.getBoundingClientRect();
    const endRect = cartIcon.getBoundingClientRect();

    // Set initial position
    clone.style.left = `${startRect.left}px`;
    clone.style.top = `${startRect.top}px`;
    clone.style.width = `${startRect.width}px`;
    clone.style.height = `${startRect.height}px`;

    // Animate to cart
    requestAnimationFrame(() => {
      clone.style.transform = `
        translate(${endRect.left - startRect.left + endRect.width/2 - startRect.width/2}px, 
                 ${endRect.top - startRect.top + endRect.height/2 - startRect.height/2}px)
        scale(0.2)
      `;
      clone.style.opacity = '0';
    });

    // Clean up after animation
    animationRef.current = setTimeout(() => {
      if (cloneRef.current) {
        cloneRef.current.remove();
        cloneRef.current = null;
      }
      onComplete?.();
    }, 700);

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      if (cloneRef.current) {
        cloneRef.current.remove();
      }
    };
  }, [isActive, productId, productImage, onComplete]);

  if (!isActive) return null;

  return createPortal(
    <div style={{ pointerEvents: 'none' }} />,
    document.body
  );
};

export default FlyToCartAnimation;
