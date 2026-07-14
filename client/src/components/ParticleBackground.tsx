import type { Engine, ISourceOptions } from "@tsparticles/engine";
import { Particles, ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useMemo } from "react";

// Must be a stable, module-level reference — ParticlesProvider throws if the
// init callback identity changes across renders.
async function initEngine(engine: Engine): Promise<void> {
  await loadSlim(engine);
}

export function ParticleBackground() {
  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      particles: {
        number: {
          value: 50,
          density: { enable: true, width: 800, height: 800 },
        },
        color: { value: "#94a3b8" },
        links: {
          enable: true,
          distance: 130,
          color: "#475569",
          opacity: 0.35,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.5,
          direction: "none",
          random: true,
          straight: false,
          outModes: { default: "out" },
        },
        opacity: { value: 0.5 },
        size: { value: { min: 1, max: 2.5 } },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: ["grab", "bubble"] },
        },
        modes: {
          grab: { distance: 140, links: { opacity: 0.6, color: "#f97316" } },
          bubble: { distance: 140, size: 4, duration: 2, opacity: 0.8, color: "#f97316" },
        },
      },
      detectRetina: true,
    }),
    [],
  );

  return (
    <ParticlesProvider init={initEngine}>
      <Particles id="login-particles" className="absolute inset-0" options={options} />
    </ParticlesProvider>
  );
}
