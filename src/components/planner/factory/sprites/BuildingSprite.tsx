import type { SpriteKey } from "@/domain/factory/buildingSprites";
import { getSpriteLabel } from "@/domain/factory/buildingSprites";

interface BuildingSpriteProps {
  spriteKey: SpriteKey;
  size?: number;
}

function SmelterSprite() {
  return (
    <>
      {/* Furnace body */}
      <rect x="6" y="12" width="20" height="16" fill="#374151" />
      {/* Chimney */}
      <rect x="10" y="2" width="6" height="12" fill="#6b7280" />
      <rect x="11" y="0" width="4" height="4" fill="#9ca3af" />
      {/* Furnace glow */}
      <rect x="8" y="22" width="16" height="6" fill="#f59e0b" />
      <rect x="10" y="24" width="12" height="4" fill="#fbbf24" />
      {/* Smoke puffs */}
      <rect x="9" y="0" width="2" height="2" fill="#9ca3af" opacity="0.5" />
      <rect x="15" y="1" width="2" height="2" fill="#9ca3af" opacity="0.3" />
    </>
  );
}

function ConstructorSprite() {
  return (
    <>
      {/* Main body */}
      <rect x="4" y="8" width="24" height="18" fill="#1e3a5f" />
      {/* Top panel */}
      <rect x="6" y="6" width="20" height="4" fill="#2563eb" />
      {/* Gear */}
      <rect x="12" y="12" width="8" height="8" fill="#60a5fa" />
      <rect x="14" y="10" width="4" height="12" fill="#60a5fa" />
      <rect x="10" y="14" width="12" height="4" fill="#60a5fa" />
      {/* Center dot */}
      <rect x="14" y="14" width="4" height="4" fill="#1e3a5f" />
      {/* Base */}
      <rect x="4" y="26" width="24" height="4" fill="#374151" />
    </>
  );
}

function AssemblerSprite() {
  return (
    <>
      {/* Wide body */}
      <rect x="2" y="10" width="28" height="16" fill="#1e3a5f" />
      {/* Two input ports */}
      <rect x="4" y="6" width="8" height="6" fill="#2563eb" />
      <rect x="20" y="6" width="8" height="6" fill="#2563eb" />
      {/* Central merge indicator */}
      <rect x="12" y="14" width="8" height="8" fill="#3b82f6" />
      <rect x="14" y="16" width="4" height="4" fill="#93c5fd" />
      {/* Output port */}
      <rect x="12" y="26" width="8" height="4" fill="#2563eb" />
      {/* Base */}
      <rect x="2" y="28" width="28" height="2" fill="#374151" />
    </>
  );
}

function ManufacturerSprite() {
  return (
    <>
      {/* Large body */}
      <rect x="2" y="6" width="28" height="22" fill="#4a1d6e" />
      {/* Three input ports */}
      <rect x="3" y="2" width="6" height="6" fill="#7c3aed" />
      <rect x="13" y="2" width="6" height="6" fill="#7c3aed" />
      <rect x="23" y="2" width="6" height="6" fill="#7c3aed" />
      {/* Processing core */}
      <rect x="10" y="12" width="12" height="10" fill="#8b5cf6" />
      <rect x="12" y="14" width="8" height="6" fill="#a78bfa" />
      {/* Base */}
      <rect x="2" y="28" width="28" height="2" fill="#374151" />
    </>
  );
}

function FoundrySprite() {
  return (
    <>
      {/* Double furnace body */}
      <rect x="2" y="10" width="12" height="18" fill="#374151" />
      <rect x="18" y="10" width="12" height="18" fill="#374151" />
      {/* Chimneys */}
      <rect x="5" y="2" width="6" height="10" fill="#6b7280" />
      <rect x="21" y="2" width="6" height="10" fill="#6b7280" />
      {/* Glow */}
      <rect x="4" y="22" width="10" height="6" fill="#ea580c" />
      <rect x="20" y="22" width="10" height="6" fill="#ea580c" />
      {/* Connecting bridge */}
      <rect x="14" y="14" width="4" height="8" fill="#4b5563" />
    </>
  );
}

function RefinerySprite() {
  return (
    <>
      {/* Main tank */}
      <rect x="8" y="4" width="16" height="24" fill="#374151" rx="2" />
      {/* Pipe columns */}
      <rect x="2" y="8" width="4" height="16" fill="#6b7280" />
      <rect x="26" y="8" width="4" height="16" fill="#6b7280" />
      {/* Tank bands */}
      <rect x="8" y="10" width="16" height="2" fill="#9ca3af" />
      <rect x="8" y="18" width="16" height="2" fill="#9ca3af" />
      {/* Viewport */}
      <rect x="12" y="12" width="8" height="4" fill="#22d3ee" />
      {/* Base */}
      <rect x="4" y="28" width="24" height="2" fill="#4b5563" />
    </>
  );
}

function BlenderSprite() {
  return (
    <>
      {/* Cylindrical body */}
      <rect x="6" y="6" width="20" height="22" fill="#0e4a5c" />
      {/* Top dome */}
      <rect x="8" y="2" width="16" height="6" fill="#0891b2" />
      {/* Mixing blades */}
      <rect x="10" y="14" width="12" height="2" fill="#22d3ee" />
      <rect x="14" y="10" width="4" height="10" fill="#22d3ee" />
      {/* Viewport */}
      <rect x="12" y="12" width="8" height="6" fill="#06b6d4" opacity="0.6" />
      {/* Base */}
      <rect x="6" y="28" width="20" height="2" fill="#374151" />
    </>
  );
}

function PackagerSprite() {
  return (
    <>
      {/* Body */}
      <rect x="6" y="8" width="20" height="18" fill="#374151" />
      {/* Top hopper */}
      <rect x="10" y="2" width="12" height="8" fill="#4b5563" />
      {/* Package output */}
      <rect x="8" y="20" width="8" height="6" fill="#a16207" />
      <rect x="9" y="21" width="6" height="4" fill="#ca8a04" />
      {/* Liquid input */}
      <rect x="18" y="12" width="6" height="8" fill="#0891b2" />
      {/* Base */}
      <rect x="6" y="28" width="20" height="2" fill="#4b5563" />
    </>
  );
}

function ParticleAcceleratorSprite() {
  return (
    <>
      {/* Large ring */}
      <rect x="2" y="4" width="28" height="24" fill="#1e1b4b" />
      {/* Inner ring */}
      <rect x="6" y="8" width="20" height="16" fill="#312e81" />
      {/* Core */}
      <rect x="10" y="12" width="12" height="8" fill="#4f46e5" />
      <rect x="12" y="14" width="8" height="4" fill="#818cf8" />
      {/* Energy arcs */}
      <rect x="4" y="14" width="4" height="4" fill="#a5b4fc" opacity="0.7" />
      <rect x="24" y="14" width="4" height="4" fill="#a5b4fc" opacity="0.7" />
      <rect x="14" y="4" width="4" height="4" fill="#a5b4fc" opacity="0.7" />
      <rect x="14" y="24" width="4" height="4" fill="#a5b4fc" opacity="0.7" />
    </>
  );
}

function MinerSprite() {
  return (
    <>
      {/* Drill frame */}
      <rect x="10" y="2" width="12" height="8" fill="#4b5563" />
      {/* Drill bit */}
      <rect x="14" y="8" width="4" height="10" fill="#9ca3af" />
      <rect x="13" y="16" width="6" height="4" fill="#6b7280" />
      <rect x="15" y="20" width="2" height="4" fill="#9ca3af" />
      {/* Base platform */}
      <rect x="4" y="24" width="24" height="6" fill="#374151" />
      {/* Legs */}
      <rect x="6" y="22" width="4" height="4" fill="#4b5563" />
      <rect x="22" y="22" width="4" height="4" fill="#4b5563" />
    </>
  );
}

function SplitterSprite() {
  return (
    <>
      {/* Diamond body */}
      <rect x="8" y="8" width="16" height="16" fill="#d97706" transform="rotate(45 16 16)" />
      {/* Center */}
      <rect x="12" y="12" width="8" height="8" fill="#fbbf24" />
      {/* Arrow indicators */}
      <rect x="14" y="6" width="4" height="4" fill="#f59e0b" />
      <rect x="14" y="22" width="4" height="4" fill="#f59e0b" />
    </>
  );
}

function MergerSprite() {
  return (
    <>
      {/* Diamond body */}
      <rect x="8" y="8" width="16" height="16" fill="#0d9488" transform="rotate(45 16 16)" />
      {/* Center */}
      <rect x="12" y="12" width="8" height="8" fill="#2dd4bf" />
      {/* Arrow indicators */}
      <rect x="6" y="14" width="4" height="4" fill="#14b8a6" />
      <rect x="22" y="14" width="4" height="4" fill="#14b8a6" />
    </>
  );
}

function UnknownSprite() {
  return (
    <>
      <rect x="6" y="6" width="20" height="20" fill="#374151" />
      <rect x="14" y="10" width="4" height="8" fill="#9ca3af" />
      <rect x="14" y="22" width="4" height="4" fill="#9ca3af" />
    </>
  );
}

const SPRITE_MAP: Record<SpriteKey, () => React.ReactNode> = {
  smelter: SmelterSprite,
  constructor: ConstructorSprite,
  assembler: AssemblerSprite,
  manufacturer: ManufacturerSprite,
  foundry: FoundrySprite,
  refinery: RefinerySprite,
  blender: BlenderSprite,
  packager: PackagerSprite,
  particle_accelerator: ParticleAcceleratorSprite,
  miner: MinerSprite,
  splitter: SplitterSprite,
  merger: MergerSprite,
  unknown: UnknownSprite,
};

export function BuildingSprite({ spriteKey, size = 32 }: BuildingSpriteProps) {
  const SpriteComponent = SPRITE_MAP[spriteKey];
  const label = getSpriteLabel(spriteKey);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-label={label}
      className="block"
    >
      <SpriteComponent />
    </svg>
  );
}
