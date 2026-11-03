import { motion, useScroll, useSpring } from "framer-motion";
import styles from "./ScrollProgressBar.module.css";

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className={styles.barContainer} aria-hidden="true">
      <motion.div className={styles.progressBar} style={{ scaleX }} />
    </div>
  );
}
