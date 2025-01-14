<script setup lang="ts">
defineOptions({
  name: 'icon',
})
const props = defineProps<{
  name: 'copy' | 'refresh' | 'disagree'
  size: number
}>()
</script>

<template>
  <div class="icon-container">
    <!-- 复制 -->
    <svg
      v-if="props.name === 'copy'"
      :width="props.size"
      :height="props.size"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13 12.4316V7.8125C13 6.2592 14.2592 5 15.8125 5H40.1875C41.7408 5 43 6.2592 43 7.8125V32.1875C43 33.7408 41.7408 35 40.1875 35H35.5163"
        stroke="#333"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M32.1875 13H7.8125C6.2592 13 5 14.2592 5 15.8125V40.1875C5 41.7408 6.2592 43 7.8125 43H32.1875C33.7408 43 35 41.7408 35 40.1875V15.8125C35 14.2592 33.7408 13 32.1875 13Z"
        fill="none"
        stroke="#333"
        stroke-width="4"
        stroke-linejoin="round"
      />
    </svg>
    <!-- 刷新 -->
    <svg
      v-if="props.name === 'refresh'"
      :width="props.size"
      :height="props.size"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="17"
        y="24.071"
        width="10"
        height="10"
        rx="2"
        transform="rotate(-45 17 24.071)"
        fill="none"
        stroke="#333"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M40.1201 16C37.1747 10.0731 31.0586 6 23.9912 6C16.9237 6 10.9454 10.0731 8 16"
        stroke="#333"
        stroke-width="4"
        stroke-linecap="round"
      />
      <path d="M8 8V16" stroke="#333" stroke-width="4" stroke-linecap="round" />
      <path
        d="M14.7803 16L8.00013 16"
        stroke="#333"
        stroke-width="4"
        stroke-linecap="round"
      />
      <path
        d="M8 32C10.9454 37.9269 17.0615 42 24.129 42C31.1964 42 37.1747 37.9269 40.1201 32"
        stroke="#333"
        stroke-width="4"
        stroke-linecap="round"
      />
      <path
        d="M40.1201 40V32"
        stroke="#333"
        stroke-width="4"
        stroke-linecap="round"
      />
      <path
        d="M33.3398 32L40.12 32"
        stroke="#333"
        stroke-width="4"
        stroke-linecap="round"
      />
    </svg>
    <!-- 不同意 -->
    <svg
      v-if="props.name === 'disagree'"
      t="1731639777615"
      class="icon"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="4261"
      :width="props.size"
      :height="props.size"
    >
      <path
        d="M154.752 682.453333h227.626667c9.557333 0 18.176 11.434667 13.909333 21.333334l-23.637333 95.872c-12.074667 60.032 11.349333 123.904 79.189333 135.04 9.258667 1.493333 18.346667 2.986667 27.733333 3.669333 55.509333 3.968 93.269333-30.634667 106.154667-78.677333l26.88-80.256c15.018667-55.978667 58.410667-96.981333 116.309333-96.981334h175.061334c19.157333 0 34.688-14.592 34.688-33.706666V141.354667a34.730667 34.730667 0 0 0-34.688-34.730667H232.832c-33.408 0-62.08 23.808-68.224 56.618667l-78.08 437.930666a68.608 68.608 0 0 0 68.266667 81.237334z m698.581333-85.333333h-85.333333V192h85.333333v405.205333zM247.296 192h436.394667v405.205333c-75.861333 12.074667-125.013333 87.168-145.408 163.157334l-21.461334 80.170666a39.04 39.04 0 0 1-37.248 28.458667 40.277333 40.277333 0 0 1-38.229333-50.602667l25.088-93.781333c7.125333-26.581333 9.002667-57.6-8.021333-82.773333-17.066667-25.258667-40.746667-44.629333-77.013334-44.629334H170.666667l76.629333-405.205333z"
        p-id="4262"
        fill="#2c2c2c"
      ></path>
    </svg>
  </div>
</template>

<style scoped lang="scss">
.icon-container {
  cursor: pointer;
  opacity: 0.6;
}
</style>
