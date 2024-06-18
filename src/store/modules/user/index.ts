import { defineStore } from "pinia";
import { ref } from "vue";
import { User } from "./type.ts";

export const useUserStore = defineStore(
  "user",
  () => {
    const userInfo = ref<User>({
      id: "1",
      username: "Bin",
      nickname: "Admin Bin",
      token: "122DADS",
      belongGroupId: "1",
      belongGroupCode: "CKC001",
      belongGroupName: "CKC专业团队",
      belongGroupColor: "#604CC3",
    });

    return {
      userInfo,
    };
  },
  { persist: false },
);
