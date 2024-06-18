import { defineStore } from "pinia";
import { computed } from "vue";
import { useCssVar } from "@vueuse/core";
import { useUserStore } from "@/store/modules/user/index.ts";

export const useColorStore = defineStore(
  "color",
  () => {
    const userStore = useUserStore();

    const { userInfo } = userStore;

    const setUserColor = () => {
      if (userInfo.belongGroupColor) {
        useCssVar("--theme-color").value = userInfo.belongGroupColor;
      }
    };

    setUserColor();

    const themeColor = computed(() => {
      return useCssVar("--theme-color").value;
    });

    return {
      themeColor,
    };
  },
  { persist: false },
);
