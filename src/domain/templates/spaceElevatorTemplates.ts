export interface ITemplate {
  key: string;
  name: string;
  description: string;
  maxTier: number;
  targets: Array<{ itemClassName: string; targetRate: number }>;
}

export const SPACE_ELEVATOR_TEMPLATES: ITemplate[] = [
  {
    key: "phase1",
    name: "Space Elevator — Phase 1",
    description: "Smart Plating",
    maxTier: 2,
    targets: [
      { itemClassName: "Desc_SpaceElevatorPart_1_C", targetRate: 2 },
    ],
  },
  {
    key: "phase2",
    name: "Space Elevator — Phase 2",
    description: "Versatile Framework + Automated Wiring",
    maxTier: 4,
    targets: [
      { itemClassName: "Desc_SpaceElevatorPart_2_C", targetRate: 5 },
      { itemClassName: "Desc_SpaceElevatorPart_3_C", targetRate: 1 },
    ],
  },
  {
    key: "phase3",
    name: "Space Elevator — Phase 3",
    description: "Modular Engine + Adaptive Control Unit",
    maxTier: 6,
    targets: [
      { itemClassName: "Desc_SpaceElevatorPart_4_C", targetRate: 1 },
      { itemClassName: "Desc_SpaceElevatorPart_5_C", targetRate: 2 },
    ],
  },
  {
    key: "phase4",
    name: "Space Elevator — Phase 4",
    description:
      "Assembly Director System + Magnetic Field Generator + Nuclear Pasta + Thermal Propulsion Rocket",
    maxTier: 9,
    targets: [
      { itemClassName: "Desc_SpaceElevatorPart_6_C", targetRate: 0.5 },
      { itemClassName: "Desc_SpaceElevatorPart_7_C", targetRate: 0.5 },
      { itemClassName: "Desc_SpaceElevatorPart_8_C", targetRate: 0.5 },
      { itemClassName: "Desc_SpaceElevatorPart_9_C", targetRate: 0.5 },
    ],
  },
  {
    key: "fullgame",
    name: "Full Game",
    description: "All four Space Elevator phases combined",
    maxTier: 9,
    targets: [
      { itemClassName: "Desc_SpaceElevatorPart_1_C", targetRate: 2 },
      { itemClassName: "Desc_SpaceElevatorPart_2_C", targetRate: 5 },
      { itemClassName: "Desc_SpaceElevatorPart_3_C", targetRate: 1 },
      { itemClassName: "Desc_SpaceElevatorPart_4_C", targetRate: 1 },
      { itemClassName: "Desc_SpaceElevatorPart_5_C", targetRate: 2 },
      { itemClassName: "Desc_SpaceElevatorPart_6_C", targetRate: 0.5 },
      { itemClassName: "Desc_SpaceElevatorPart_7_C", targetRate: 0.5 },
      { itemClassName: "Desc_SpaceElevatorPart_8_C", targetRate: 0.5 },
      { itemClassName: "Desc_SpaceElevatorPart_9_C", targetRate: 0.5 },
    ],
  },
];

export const TEMPLATE_MAP = new Map<string, ITemplate>(
  SPACE_ELEVATOR_TEMPLATES.map((t) => [t.key, t])
);
