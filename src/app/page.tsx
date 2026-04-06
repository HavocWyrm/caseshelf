import { getDashboardCounts } from "@/actions/item";
import DashboardRow from "@/components/dashboard/DashboardRow";
import styles from "@/styles/dashboard.module.css";

export const dynamic = "force-dynamic";

export default async function Home() {
  const counts = await getDashboardCounts();

  return (
    <div className={styles.dashboard}>
      <DashboardRow itemType="game" owned={counts.game.owned} total={counts.game.total} />
      <DashboardRow itemType="movie" owned={counts.movie.owned} total={counts.movie.total} />
      <DashboardRow itemType="show" owned={counts.show.owned} total={counts.show.total} />
    </div>
  );
}