import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import styles from "./TiltCard.module.css";

/**
 * TiltCard
 * Premium 3D perspective tilt container with spring physics and glossy glare.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {number} [props.maxRotation=12] - Max degrees of tilt
 * @param {boolean} [props.glare=true] - Whether to show the glossy glare sheen
 */
export default function TiltCard({
  children,
  className = "",
  maxRotation = 10,
  glare = true,
  ...rest
}) {
  const cardRef = useRef(null);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { stiffness: 260, damping: 20 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  // Map normalized 0..1 mouse coordinates to rotation angles
  const rotateX = useTransform(smoothY, [0, 1], [maxRotation, -maxRotation]);
  const rotateY = useTransform(smoothX, [0, 1], [-maxRotation, maxRotation]);

  // Glare opacity and position
  const glareOpacity = useTransform(smoothY, [0, 0.5, 1], [0.15, 0.25, 0.15]);
  const glareBackground = useTransform(
    [smoothX, smoothY],
    ([currX, currY]) =>
      `radial-gradient(circle 350px at ${currX * 100}% ${currY * 100}%, rgba(255,255,255,0.2), transparent 70%)`
  );

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width;
    const normalizedY = (e.clientY - rect.top) / rect.height;
    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`${styles.tiltWrapper} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.2 }}
      {...rest}
    >
      <div className={styles.tiltInner} style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>

      {glare && (
        <motion.div
          className={styles.glareLayer}
          style={{
            background: glareBackground,
            opacity: glareOpacity,
          }}
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
}
