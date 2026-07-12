"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, useSpring, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.15, 1]; // Increased start scale for more zoom motion
  };

  // Tuned spring settings for high inertia and fluid momentum (slower acceleration, higher damping)
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 40,
    stiffness: 60,
    mass: 1.2,
    restDelta: 0.0001, // Prevent micro-stutter at the end of the spring cycle
  });

  // Mapped to [0, 0.45] so the tilt is active/pronounced and completes faster during scroll
  const rotate = useTransform(smoothProgress, [0, 0.45], [22, 0]); 
  const scale = useTransform(smoothProgress, [0, 0.45], scaleDimensions());
  const translate = useTransform(smoothProgress, [0, 0.45], [0, -100]);

  return (
    <div
      className="h-[55rem] md:h-[90rem] flex flex-col items-center justify-start relative p-2 md:p-10 pt-24 md:pt-36"
      ref={containerRef}
    >
      <div
        className="w-full relative py-8 md:py-12"
        style={{
          perspective: "1000px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: any) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="max-w-5xl mx-auto text-center relative z-20"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow: "0 25px 70px -10px rgba(0, 0, 0, 0.95)", // Optimized single heavy shadow (much cheaper to render)
        willChange: "transform", // Forces GPU layer promotion to prevent lag during 3D rotations
      }}
      className="max-w-5xl mt-12 md:mt-20 mx-auto h-[26rem] md:h-[42rem] w-full border-4 border-zinc-800 p-2 md:p-4 bg-zinc-950 rounded-[30px] relative z-10"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-black border border-white/10">
        {children}
      </div>
    </motion.div>
  );
};
