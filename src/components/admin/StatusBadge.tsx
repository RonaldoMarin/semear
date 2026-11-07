import type { StatusEvento } from "@prisma/client";
import { statusEventoLabel } from "@/lib/eventos/labels";
import styles from "./StatusBadge.module.css";

export function StatusBadge({ status }: { status: StatusEvento }) {
  return (
    <span className={styles.badge} data-status={status}>
      <span className={styles.dot} aria-hidden="true" />
      {statusEventoLabel[status]}
    </span>
  );
}
