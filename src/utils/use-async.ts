import type { Ref } from "vue";
import { ref } from "vue";
import { handleGlobalError } from "./errorHandler";

interface UseAsync<T extends (...args: unknown[]) => unknown> {
  active: Ref<boolean>;
  run: (...args: Parameters<T>) => Promise<ReturnType<T> | void>;
}

export default function useAsync<T extends (...args: unknown[]) => unknown>(
  fn: T
): UseAsync<T> {
  const active: UseAsync<T>["active"] = ref(false);

  const run: UseAsync<T>["run"] = async (...args) => {
    active.value = true;
    try {
      const result = await fn(...args);
      return result as ReturnType<T>;
    } catch (error) {
      await handleGlobalError(error);
    } finally {
      active.value = false;
    }
  };

  return { active, run };
}
