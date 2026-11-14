export interface LandingViewProps {
  motionActive: boolean;
  paused: boolean;
  logoRevision: number;
  onToggleMotion(): void;
  onReplayLogo(): void;
  onOpenMission(): void;
  onOpenExplorer(): void;
  onOpenCrew(): void;
}
