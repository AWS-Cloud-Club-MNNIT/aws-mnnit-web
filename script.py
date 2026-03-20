import xml.etree.ElementTree as ET
import re

tree = ET.parse('/Users/aryangupta/Documents/AWS/aws-mnnit-web/public/logo.svg')
root = tree.getroot()

paths = []
for elem in root.iter():
    if elem.tag.endswith('path'):
        d = elem.get('d')
        transform = elem.get('transform')
        fill = elem.get('fill')
        if d and fill and fill != "#000000":
            paths.append((d, transform, fill))

component = """\"use client\";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3800); // 3.8s total loading time
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0F1A]"
        >
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
            <svg viewBox="0 0 447 559" className="w-full h-full drop-shadow-[0_0_20px_rgba(124,58,237,0.3)]">
"""

for i, (d, transform, fill) in enumerate(paths):
    trans_attr = f' transform="{transform}"' if transform else ''
    component += f'''              <motion.path
                d="{d}"{trans_attr}
                initial={{{{ pathLength: 0, fill: "{fill}00", stroke: "rgba(124, 58, 237, 1)", strokeWidth: 1 }}}}
                animate={{{{ pathLength: 1, fill: "{fill}ff", stroke: "rgba(124, 58, 237, 0)" }}}}
                transition={{{{ duration: 2, ease: "easeInOut", delay: {min(i * 0.02, 1.5)} }}}}
              />\n'''

component += """            </svg>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.2 }}
            className="mt-8 text-primary font-mono text-xl tracking-widest uppercase"
          >
            AWS Cloud Club MNNIT
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
"""

with open('/Users/aryangupta/Documents/AWS/aws-mnnit-web/components/loading-screen.tsx', 'w') as f:
    f.write(component)
