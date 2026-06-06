"use client";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

export default function HeroGradient() {
  return (
    <ShaderGradientCanvas
      style={{ position: "absolute", inset: 0, zIndex: 0 }}
      pixelDensity={1}
      fov={45}
    >
      <ShaderGradient
        type="waterPlane"
        animate="on"
        uTime={0}
        color1="#07001a"
        color2="#02000e"
        color3="#160045"
        uSpeed={0.07}
        uStrength={1.3}
        uDensity={1.0}
        uFrequency={5.5}
        uAmplitude={0}
        positionX={0}
        positionY={0}
        positionZ={0}
        rotationX={50}
        rotationY={0}
        rotationZ={-60}
        cDistance={28}
        cPolarAngle={115}
        cAzimuthAngle={180}
        lightType="3d"
        envPreset="city"
        reflection={0.1}
        brightness={1.1}
        grain="off"
        toggleAxis={false}
        zoomOut={false}
      />
    </ShaderGradientCanvas>
  );
}
