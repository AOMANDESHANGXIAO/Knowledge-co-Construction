<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <svg v-if="name === 'play'" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5v14l11-7z" fill="currentColor"/>
  </svg>

  <svg v-else-if="name === 'stop'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path
        fill="currentColor"
        d="M8 16h8V8H8zm4 6q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22"
    />
  </svg>

  <svg v-else-if="name === 'horizontal'" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M2,12 L22,12" stroke="currentColor" stroke-width="2"/>
    <path d="M7,7 L2,12 L7,17" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M17,7 L22,12 L17,17" stroke="currentColor" stroke-width="2" fill="none"/>
  </svg>

  <svg v-else-if="name === 'vertical'" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12,2 L12,22" stroke="currentColor" stroke-width="2"/>
    <path d="M7,7 L12,2 L17,7" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M7,17 L12,22 L17,17" stroke="currentColor" stroke-width="2" fill="none"/>
  </svg>

  <svg v-else-if="name === 'shuffle'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path
        fill="currentColor"
        d="M14 20v-2h2.6l-3.175-3.175L14.85 13.4L18 16.55V14h2v6zm-8.6 0L4 18.6L16.6 6H14V4h6v6h-2V7.4zm3.775-9.425L4 5.4L5.4 4l5.175 5.175z"
    />
  </svg>
  <section v-else class="svg-icon">
    <svg v-if="name === 'home'" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
         viewBox="0 0 521 521">
      <path d="M80 212v236a16 16 0 0 0 16 16h96V328a24 24 0 0 1 24-24h80a24 24 0 0 1 24 24v136h96a16 16 0 0 0 16-16V212"
            fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></path>
      <path d="M480 256L266.89 52c-5-5.28-16.69-5.34-21.78 0L32 256" fill="none" stroke="currentColor"
            stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></path>
      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"
            d="M400 179V64h-48v69"></path>
    </svg>

    <svg v-else-if="name === 'idea'" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
         viewBox="0 0 32 32">
      <path d="M11 24h10v2H11z" fill="currentColor"></path>
      <path d="M13 28h6v2h-6z" fill="currentColor"></path>
      <path
          d="M16 2A10 10 0 0 0 6 12a9.19 9.19 0 0 0 3.46 7.62c1 .93 1.54 1.46 1.54 2.38h2c0-1.84-1.11-2.87-2.19-3.86A7.2 7.2 0 0 1 8 12a8 8 0 0 1 16 0a7.2 7.2 0 0 1-2.82 6.14c-1.07 1-2.18 2-2.18 3.86h2c0-.92.53-1.45 1.54-2.39A9.18 9.18 0 0 0 26 12A10 10 0 0 0 16 2z"
          fill="currentColor"></path>
    </svg>

    <svg v-else-if="name === 'setting'" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 20 20">
      <g fill="none">
        <path
            d="M6.5 6a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zM6 9.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 0 0 1h2.707c.099-.349.23-.683.393-1H6.5zm-1 4h3.707c.099.349.23.683.393 1H5.5A2.5 2.5 0 0 1 3 14.5v-9A2.5 2.5 0 0 1 5.5 3h9A2.5 2.5 0 0 1 17 5.5v4.1a5.465 5.465 0 0 0-1-.393V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16zm6.565-4.558a2 2 0 0 1-1.43 2.478l-.461.118a4.735 4.735 0 0 0 .01 1.016l.35.083a2 2 0 0 1 1.455 2.519l-.126.423c.257.203.537.377.835.517l.325-.344a2 2 0 0 1 2.909.002l.337.358c.293-.135.568-.302.822-.498l-.156-.556a2 2 0 0 1 1.43-2.478l.461-.118a4.731 4.731 0 0 0-.01-1.017l-.349-.082a2 2 0 0 1-1.456-2.52l.126-.421a4.318 4.318 0 0 0-.835-.519l-.324.344a2 2 0 0 1-2.91-.001l-.337-.358a4.316 4.316 0 0 0-.822.497l.156.557zM14.5 15.5a1 1 0 1 1 0-2a1 1 0 0 1 0 2z"
            fill="currentColor"></path>
      </g>
    </svg>
  </section>


</template>

<style scoped lang="scss">
.svg-icon {
  width: 24px;
  height: 24px;

  svg {
    width: 100%;
    height: 100%;
  }
}

</style>
