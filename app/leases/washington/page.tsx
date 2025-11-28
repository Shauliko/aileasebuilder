import StateLeasePage from "../_components/StateLeasePage";
import { STATE_CONFIGS } from "../stateConfigs";

const CONFIG = STATE_CONFIGS.find((s) => s.slug === "washington")!;

export const metadata = {
  title: "Washington Residential Lease Agreement – AI Lease Builder",
  description:
    "Generate a Washington residential lease compliant with WA rental laws. Lawyer-grade, state-specific agreements for Washington properties.",
};

export default function Page() {
  return <StateLeasePage config={CONFIG} />;
}
